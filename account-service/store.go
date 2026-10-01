package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/20261001_account_scenarios.up.sql
var migrationUp string

//go:embed migrations/20261001_account_scenarios.down.sql
var migrationDown string

type postgresStore struct{ pool *pgxpool.Pool }

func (s postgresStore) load(ctx context.Context, owner string) (*savedScenario, error) {
	var saved savedScenario
	err := s.pool.QueryRow(ctx, `SELECT revision, scenario, updated_at FROM zencelades_account_scenarios WHERE owner_subject=$1`, owner).Scan(&saved.Revision, &saved.Scenario, &saved.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &saved, nil
}

func (s postgresStore) save(ctx context.Context, owner string, revision int64, scenario json.RawMessage) (*savedScenario, error) {
	var row pgx.Row
	if revision == 0 {
		row = s.pool.QueryRow(ctx, `INSERT INTO zencelades_account_scenarios (owner_subject, scenario)
			VALUES ($1, $2) ON CONFLICT (owner_subject) DO NOTHING
			RETURNING revision, scenario, updated_at`, owner, scenario)
	} else {
		row = s.pool.QueryRow(ctx, `UPDATE zencelades_account_scenarios
			SET scenario=$3, revision=revision+1, updated_at=clock_timestamp()
			WHERE owner_subject=$1 AND revision=$2
			RETURNING revision, scenario, updated_at`, owner, revision, scenario)
	}
	var saved savedScenario
	err := row.Scan(&saved.Revision, &saved.Scenario, &saved.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errConflict
	}
	if err != nil {
		return nil, err
	}
	return &saved, nil
}
