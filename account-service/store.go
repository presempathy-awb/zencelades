package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/20261001_account_drafts.up.sql
var migrationUp string

//go:embed migrations/20261001_account_drafts.down.sql
var migrationDown string

type postgresStore struct {
	pool *pgxpool.Pool
	kind string
}

func (s postgresStore) load(ctx context.Context, owner string) (*savedDraft, error) {
	var saved savedDraft
	err := s.pool.QueryRow(ctx, `SELECT revision, document, updated_at FROM zencelades_account_drafts WHERE owner_subject=$1 AND document_kind=$2`, owner, s.kind).Scan(&saved.Revision, &saved.Document, &saved.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &saved, nil
}

func (s postgresStore) save(ctx context.Context, owner string, revision int64, document json.RawMessage) (*savedDraft, error) {
	var row pgx.Row
	if revision == 0 {
		row = s.pool.QueryRow(ctx, `INSERT INTO zencelades_account_drafts (owner_subject, document_kind, document)
			VALUES ($1, $2, $3) ON CONFLICT (owner_subject, document_kind) DO NOTHING
			RETURNING revision, document, updated_at`, owner, s.kind, document)
	} else {
		row = s.pool.QueryRow(ctx, `UPDATE zencelades_account_drafts
			SET document=$4, revision=revision+1, updated_at=clock_timestamp()
			WHERE owner_subject=$1 AND document_kind=$2 AND revision=$3
			RETURNING revision, document, updated_at`, owner, s.kind, revision, document)
	}
	var saved savedDraft
	err := row.Scan(&saved.Revision, &saved.Document, &saved.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errConflict
	}
	if err != nil {
		return nil, err
	}
	return &saved, nil
}
