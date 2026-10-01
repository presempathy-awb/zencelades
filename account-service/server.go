package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"time"

	login "git.telpher.stream/telpher/gimmesomepaw.git"
)

const maxRequestBytes = 50512
const maxRevision = 9007199254740990 // Keep the next revision exactly representable in JavaScript.

var errConflict = errors.New("scenario revision conflict")

type savedDraft struct {
	Revision  int64           `json:"revision"`
	Document  json.RawMessage `json:"document"`
	UpdatedAt time.Time       `json:"updatedAt"`
}

type draftStore interface {
	load(context.Context, string) (*savedDraft, error)
	save(context.Context, string, int64, json.RawMessage) (*savedDraft, error)
}

type accountAPI struct {
	auth   outpostAuth
	store  draftStore
	naming draftStore
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	data, err := json.Marshal(value)
	if err != nil {
		http.Error(w, "Response unavailable", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	// A failed client write cannot be retried after headers; no persistent state changes here.
	if _, err := w.Write(data); err != nil {
		return
	}
}

func apiError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func (a *accountAPI) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /account/api/session", a.session)
	mux.HandleFunc("GET /account/api/scenarios/current", func(w http.ResponseWriter, r *http.Request) { a.load(w, r, a.store) })
	mux.HandleFunc("PUT /account/api/scenarios/current", func(w http.ResponseWriter, r *http.Request) { a.save(w, r, a.store, maxRequestBytes, validSnapshot) })
	mux.HandleFunc("GET /account/api/naming/current", func(w http.ResponseWriter, r *http.Request) { a.load(w, r, a.naming) })
	mux.HandleFunc("PUT /account/api/naming/current", func(w http.ResponseWriter, r *http.Request) {
		a.save(w, r, a.naming, maxNamingBytes+512, validNamingSnapshot)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "private, no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Vary", "Cookie")
		mux.ServeHTTP(w, r)
	})
}

func (a *accountAPI) user(w http.ResponseWriter, r *http.Request, required bool) (*principal, bool) {
	who, err := a.auth.verify(r.Context(), r)
	if err != nil {
		apiError(w, 503, "identity_unavailable", "Sign-in verification is unavailable. Your draft has not been saved.")
		return nil, false
	}
	if who == nil && required {
		apiError(w, 401, "sign_in_required", "Sign in to save or load your account draft.")
		return nil, false
	}
	// This header binds the UI's displayed account, never chooses the database owner.
	if required && (len(r.Header.Values("X-Account-Subject")) != 1 || r.Header.Get("X-Account-Subject") != who.ID) {
		apiError(w, 409, "account_changed", "The signed-in account changed. Refresh account status before saving or loading.")
		return nil, false
	}
	return who, true
}

func (a *accountAPI) session(w http.ResponseWriter, r *http.Request) {
	who, ok := a.user(w, r, false)
	if !ok {
		return
	}
	writeJSON(w, 200, map[string]any{"data": map[string]any{"user": who, "signInURL": login.SignInURL("/"), "signOutURL": login.SignOutURL()}})
}

func (a *accountAPI) load(w http.ResponseWriter, r *http.Request, store draftStore) {
	who, ok := a.user(w, r, true)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	saved, err := store.load(ctx, who.ID)
	if err != nil {
		apiError(w, 503, "storage_unavailable", "The saved draft is unavailable. Keep your current draft and try again.")
		return
	}
	writeJSON(w, 200, map[string]any{"data": saved})
}

func (a *accountAPI) save(w http.ResponseWriter, r *http.Request, store draftStore, maxBytes int64, validate func(json.RawMessage) bool) {
	// Cookie-authenticated mutations must originate on this exact public origin.
	if len(r.Header.Values("Origin")) != 1 || r.Header.Get("Origin") != a.auth.origin || (r.Header.Get("Sec-Fetch-Site") != "" && r.Header.Get("Sec-Fetch-Site") != "same-origin") {
		apiError(w, 403, "origin_rejected", "Save from this website's own window.")
		return
	}
	who, ok := a.user(w, r, true)
	if !ok {
		return
	}
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		apiError(w, 415, "json_required", "Send a JSON document.")
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, maxBytes))
	if err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			apiError(w, 413, "request_too_large", "Document exceeds the save size limit.")
		} else {
			apiError(w, 400, "invalid_request", "Cannot read this save request.")
		}
		return
	}
	var request struct {
		ExpectedRevision *int64          `json:"expectedRevision"`
		Document         json.RawMessage `json:"document"`
	}
	if err := decodeStrict(body, &request); err != nil || request.ExpectedRevision == nil || *request.ExpectedRevision < 0 || *request.ExpectedRevision > maxRevision || !validate(request.Document) {
		apiError(w, 400, "invalid_request", "Send a schema-1 document and a valid expectedRevision.")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	saved, err := store.save(ctx, who.ID, *request.ExpectedRevision, request.Document)
	if errors.Is(err, errConflict) {
		apiError(w, 409, "revision_conflict", "A newer account draft exists. Export this draft before loading the saved version.")
		return
	}
	if err != nil {
		apiError(w, 503, "storage_unavailable", "Save was not confirmed. Keep or export your draft before trying again.")
		return
	}
	writeJSON(w, 200, map[string]any{"data": saved})
}
