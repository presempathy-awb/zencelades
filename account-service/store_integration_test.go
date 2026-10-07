package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed testdata/scenario.json
var completeScenario json.RawMessage

// The URL must name a disposable test database. Never use the live project URL.
func TestPostgresPersistence(t *testing.T) {
	dsn := os.Getenv("ZENCELADES_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("requires isolated PostgreSQL 18 fixture")
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { pool.Close() })
	// Some CI runners start tests before the service container is healthy.
	// Wait for a real connection, bounded independently of the persistence test.
	readyCtx, cancel := context.WithTimeout(ctx, time.Minute)
	defer cancel()
	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()
	for err := pool.Ping(readyCtx); err != nil; err = pool.Ping(readyCtx) {
		select {
		case <-readyCtx.Done():
			t.Fatalf("PG18 fixture did not become ready: %v (last connection error: %v)", readyCtx.Err(), err)
		case <-ticker.C:
		}
	}
	var database string
	var version int
	if err := pool.QueryRow(ctx, "SELECT current_database(), current_setting('server_version_num')::int").Scan(&database, &version); err != nil {
		t.Fatal(err)
	}
	if database != "zencelades_account_test" || version < 180000 || version >= 190000 {
		t.Fatal("refusing non-fixture database or non-PG18 server")
	}
	if _, err := pool.Exec(ctx, migrationUp); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if _, err := pool.Exec(context.Background(), migrationDown); err != nil {
			t.Error(err)
		}
	})
	s := postgresStore{pool: pool, kind: "scenario"}
	first, err := s.save(ctx, "alice", 0, completeScenario)
	if err != nil || first.Revision != 1 || first.UpdatedAt.IsZero() {
		t.Fatalf("first=%v err=%v", first, err)
	}
	other, err := s.load(ctx, "bob")
	if err != nil || other != nil {
		t.Fatalf("cross-account read: %v %v", other, err)
	}
	if _, err := s.save(ctx, "bob", 1, json.RawMessage(testScenario)); !errors.Is(err, errConflict) {
		t.Fatalf("missing owner update: %v", err)
	}
	if _, err := s.save(ctx, "alice", 0, json.RawMessage(testScenario)); !errors.Is(err, errConflict) {
		t.Fatalf("create overwrite: %v", err)
	}
	var wg sync.WaitGroup
	results := make(chan error, 2)
	for range 2 {
		wg.Add(1)
		go func() { defer wg.Done(); _, err := s.save(ctx, "alice", 1, completeScenario); results <- err }()
	}
	wg.Wait()
	close(results)
	wins, conflicts := 0, 0
	for err := range results {
		if err == nil {
			wins++
		} else if errors.Is(err, errConflict) {
			conflicts++
		} else {
			t.Fatal(err)
		}
	}
	if wins != 1 || conflicts != 1 {
		t.Fatalf("concurrent writes: wins=%d conflicts=%d", wins, conflicts)
	}
	// Close the pool and reopen to prove the snapshot is stored in PostgreSQL.
	pool.Close()
	reopened, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	pool = reopened
	s = postgresStore{pool: reopened, kind: "scenario"}
	read, err := s.load(ctx, "alice")
	if err != nil || read == nil || read.Revision != 2 {
		t.Fatalf("reopened read: %v %v", read, err)
	}
	var got, want any
	if err := json.Unmarshal(read.Document, &got); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(completeScenario, &want); err != nil {
		t.Fatal(err)
	}
	gotBytes, err := json.Marshal(got)
	if err != nil {
		t.Fatal(err)
	}
	wantBytes, err := json.Marshal(want)
	if err != nil {
		t.Fatal(err)
	}
	if string(gotBytes) != string(wantBytes) {
		t.Fatal("stored snapshot changed")
	}
	naming := postgresStore{pool: reopened, kind: "naming"}
	if empty, err := naming.load(ctx, "alice"); err != nil || empty != nil {
		t.Fatalf("scenario leaked into Naming: %v %v", empty, err)
	}
	// Match the published workbench's scale and preserve its nested receipt data.
	namingJSON := json.RawMessage(`{"schema":1,"palette":{"families":[{"id":"moon","words":["luna"]}]},"shelves":{"names":{"zorbit":{"favorite":true,"report":{"evidence":[{"snippet":"` + strings.Repeat("ice", 400000) + `"}]}}}}}`)
	if !validNamingSnapshot(namingJSON) {
		t.Fatal("representative Naming document rejected")
	}
	if saved, err := naming.save(ctx, "alice", 0, namingJSON); err != nil || saved.Revision != 1 {
		t.Fatalf("Naming first save: %v %v", saved, err)
	}
	if _, err := naming.save(ctx, "alice", 0, namingJSON); !errors.Is(err, errConflict) {
		t.Fatalf("Naming overwrite accepted: %v", err)
	}
	if other, err := naming.load(ctx, "bob"); err != nil || other != nil {
		t.Fatalf("Naming cross-account read: %v %v", other, err)
	}
	namingRead, err := naming.load(ctx, "alice")
	if err != nil || namingRead == nil {
		t.Fatalf("Naming read: %v %v", namingRead, err)
	}
	if err := json.Unmarshal(namingRead.Document, &got); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(namingJSON, &want); err != nil {
		t.Fatal(err)
	}
	gotBytes, err = json.Marshal(got)
	if err != nil {
		t.Fatal(err)
	}
	wantBytes, err = json.Marshal(want)
	if err != nil {
		t.Fatal(err)
	}
	if string(gotBytes) != string(wantBytes) {
		t.Fatal("Naming receipts changed in storage")
	}
	if unchanged, err := s.load(ctx, "alice"); err != nil || unchanged.Revision != 2 {
		t.Fatalf("Naming save changed scenario: %v %v", unchanged, err)
	}
	outpost := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Cookie") != "session=alice" {
			w.WriteHeader(401)
			return
		}
		w.Header().Set("X-authentik-uid", "alice")
		w.Header().Set("X-authentik-username", "artist")
	}))
	t.Cleanup(outpost.Close)
	api := httptest.NewServer((&accountAPI{auth: outpostAuth{endpoint: outpost.URL, origin: "https://art.example", client: authClient()}, store: s, naming: naming}).handler())
	t.Cleanup(api.Close)
	request, err := http.NewRequestWithContext(ctx, http.MethodPut, api.URL+"/account/api/scenarios/current", strings.NewReader(`{"expectedRevision":2,"document":`+string(completeScenario)+`}`))
	if err != nil {
		t.Fatal(err)
	}
	request.Header.Set("Origin", "https://art.example")
	request.Header.Set("Cookie", "session=alice")
	request.Header.Set("X-Account-Subject", "alice")
	request.Header.Set("Content-Type", "application/json")
	response, err := api.Client().Do(request)
	if err != nil {
		t.Fatal(err)
	}
	body, readErr := io.ReadAll(response.Body)
	closeErr := response.Body.Close()
	if readErr != nil || closeErr != nil || response.StatusCode != 200 {
		t.Fatalf("HTTP save status=%d body=%s read=%v close=%v", response.StatusCode, body, readErr, closeErr)
	}
	verified, err := s.load(ctx, "alice")
	if err != nil || verified.Revision != 3 {
		t.Fatalf("HTTP to PG18 write: %v %v", verified, err)
	}
	request, err = http.NewRequestWithContext(ctx, http.MethodPut, api.URL+"/account/api/naming/current", strings.NewReader(`{"expectedRevision":1,"document":`+string(namingJSON)+`}`))
	if err != nil {
		t.Fatal(err)
	}
	request.Header.Set("Origin", "https://art.example")
	request.Header.Set("Cookie", "session=alice")
	request.Header.Set("X-Account-Subject", "alice")
	request.Header.Set("Content-Type", "application/json")
	response, err = api.Client().Do(request)
	if err != nil {
		t.Fatal(err)
	}
	body, readErr = io.ReadAll(response.Body)
	closeErr = response.Body.Close()
	if readErr != nil || closeErr != nil || response.StatusCode != 200 {
		t.Fatalf("Naming HTTP save status=%d read=%v close=%v", response.StatusCode, readErr, closeErr)
	}
	var result struct {
		Data savedDraft `json:"data"`
	}
	if err := json.Unmarshal(body, &result); err != nil || result.Data.Revision != 2 || !validNamingSnapshot(result.Data.Document) {
		t.Fatalf("Naming HTTP response: revision=%d err=%v", result.Data.Revision, err)
	}
	if verified, err := naming.load(ctx, "alice"); err != nil || verified.Revision != 2 {
		t.Fatalf("Naming HTTP to PG18 write: %v %v", verified, err)
	}
	if _, err := reopened.Exec(ctx, migrationDown); err != nil {
		t.Fatal(err)
	}
	if _, err := reopened.Exec(ctx, migrationUp); err != nil {
		t.Fatal(err)
	}
	empty, err := s.load(ctx, "alice")
	if err != nil || empty != nil {
		t.Fatalf("rollback/reapply: %v %v", empty, err)
	}
}
