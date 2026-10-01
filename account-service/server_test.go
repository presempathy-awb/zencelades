package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const testScenario = `{"schema":1,"selected":"love-burn","settings":{},"allowances":{},"haze":false,"note":"artist draft","funding":{},"board":{},"parts":{}}`

type memoryScenarios struct{ rows map[string]savedScenario }

func (s *memoryScenarios) load(_ context.Context, owner string) (*savedScenario, error) {
	v, ok := s.rows[owner]
	if !ok {
		return nil, nil
	}
	return &v, nil
}
func (s *memoryScenarios) save(_ context.Context, owner string, revision int64, payload json.RawMessage) (*savedScenario, error) {
	old := s.rows[owner]
	if old.Revision != revision {
		return nil, errConflict
	}
	next := savedScenario{Revision: revision + 1, Scenario: payload}
	s.rows[owner] = next
	return &next, nil
}

func testAPI(t *testing.T) http.Handler {
	t.Helper()
	outpost := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Header.Get("Cookie") {
		case "session=alice", "session=bob":
			w.Header().Set("X-authentik-uid", r.Header.Get("Cookie"))
			w.Header().Set("X-authentik-username", "artist")
			w.WriteHeader(204)
		case "session=outage":
			w.WriteHeader(503)
		default:
			w.WriteHeader(401)
		}
	}))
	t.Cleanup(outpost.Close)
	return (&accountAPI{auth: outpostAuth{endpoint: outpost.URL, origin: "https://art.example", client: authClient()}, store: &memoryScenarios{rows: map[string]savedScenario{}}}).handler()
}

func apiRequest(h http.Handler, method, path, cookie, origin, body string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(method, path, strings.NewReader(body))
	r.Header.Set("Cookie", cookie)
	r.Header.Set("X-Account-Subject", cookie)
	r.Header.Set("Origin", origin)
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("X-authentik-uid", "session=alice")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func TestAccountIsolationAndConflicts(t *testing.T) {
	h := testAPI(t)
	for _, tc := range []struct {
		name, method, path, cookie, body string
		status                           int
		contains                         string
	}{
		{"guest session", "GET", "/account/api/session", "", "", 200, `"user":null`},
		{"guest cannot save forged identity", "PUT", "/account/api/scenarios/current", "", `{"expectedRevision":0,"scenario":` + testScenario + `}`, 401, "sign_in_required"},
		{"first save", "PUT", "/account/api/scenarios/current", "session=alice", `{"expectedRevision":0,"scenario":` + testScenario + `}`, 200, `"revision":1`},
		{"own read", "GET", "/account/api/scenarios/current", "session=alice", "", 200, "artist draft"},
		{"other account empty", "GET", "/account/api/scenarios/current", "session=bob", "", 200, `"data":null`},
		{"stale write", "PUT", "/account/api/scenarios/current", "session=alice", `{"expectedRevision":0,"scenario":` + testScenario + `}`, 409, "revision_conflict"},
		{"update", "PUT", "/account/api/scenarios/current", "session=alice", `{"expectedRevision":1,"scenario":` + testScenario + `}`, 200, `"revision":2`},
		{"expired session read", "GET", "/account/api/scenarios/current", "", "", 401, "sign_in_required"},
		{"outpost failure", "GET", "/account/api/session", "session=outage", "", 503, "identity_unavailable"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := apiRequest(h, tc.method, tc.path, tc.cookie, "https://art.example", tc.body)
			if w.Code != tc.status || !strings.Contains(w.Body.String(), tc.contains) {
				t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
			}
			if w.Header().Get("Cache-Control") != "private, no-store" {
				t.Fatal("private response can be cached")
			}
		})
	}
}

func TestSaveRequestBoundary(t *testing.T) {
	for _, tc := range []struct {
		name, origin, contentType, body string
		status                          int
	}{
		{"cross origin", "https://outside.example", "application/json", `{"expectedRevision":0,"scenario":` + testScenario + `}`, 403},
		{"missing origin", "", "application/json", `{"expectedRevision":0,"scenario":` + testScenario + `}`, 403},
		{"form content", "https://art.example", "text/plain", testScenario, 415},
		{"trailing json", "https://art.example", "application/json", `{"expectedRevision":0,"scenario":` + testScenario + `} {}`, 400},
		{"missing revision", "https://art.example", "application/json", `{"scenario":` + testScenario + `}`, 400},
		{"negative revision", "https://art.example", "application/json", `{"expectedRevision":-1,"scenario":` + testScenario + `}`, 400},
		{"owner injection", "https://art.example", "application/json", `{"owner":"other","expectedRevision":0,"scenario":` + testScenario + `}`, 400},
		{"invalid snapshot", "https://art.example", "application/json", `{"expectedRevision":0,"scenario":{"schema":1}}`, 400},
		{"oversize", "https://art.example", "application/json", strings.Repeat(" ", 51000), 413},
	} {
		t.Run(tc.name, func(t *testing.T) {
			h := testAPI(t)
			r := httptest.NewRequest("PUT", "/account/api/scenarios/current", strings.NewReader(tc.body))
			r.Header.Set("Cookie", "session=alice")
			r.Header.Set("X-Account-Subject", "session=alice")
			r.Header.Set("Origin", tc.origin)
			r.Header.Set("Content-Type", tc.contentType)
			w := httptest.NewRecorder()
			h.ServeHTTP(w, r)
			if w.Code != tc.status {
				t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
			}
			read := apiRequest(h, "GET", "/account/api/scenarios/current", "session=alice", "", "")
			if !strings.Contains(read.Body.String(), `"data":null`) {
				t.Fatal("invalid request saved data")
			}
		})
	}
}

type unavailableStore struct{}

func TestAccountSwitchCannotSavePreviousAccountDraft(t *testing.T) {
	h := testAPI(t)
	for _, method := range []string{"GET", "PUT"} {
		r := httptest.NewRequest(method, "/account/api/scenarios/current", strings.NewReader(`{"expectedRevision":0,"scenario":`+testScenario+`}`))
		r.Header.Set("Cookie", "session=bob")
		r.Header.Set("X-Account-Subject", "session=alice")
		r.Header.Set("Origin", "https://art.example")
		r.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != 409 || !strings.Contains(w.Body.String(), "account_changed") {
			t.Fatalf("%s status=%d body=%s", method, w.Code, w.Body.String())
		}
	}
}

func (unavailableStore) load(context.Context, string) (*savedScenario, error) {
	return nil, errors.New("private database detail")
}
func (unavailableStore) save(context.Context, string, int64, json.RawMessage) (*savedScenario, error) {
	return nil, errors.New("private database detail")
}

func TestStoreFailureDoesNotLeak(t *testing.T) {
	outpost := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-authentik-uid", "session=alice")
		w.Header().Set("X-authentik-username", "artist")
	}))
	defer outpost.Close()
	h := (&accountAPI{auth: outpostAuth{endpoint: outpost.URL, origin: "https://art.example", client: authClient()}, store: unavailableStore{}}).handler()
	for _, method := range []string{"GET", "PUT"} {
		w := apiRequest(h, method, "/account/api/scenarios/current", "session=alice", "https://art.example", `{"expectedRevision":0,"scenario":`+testScenario+`}`)
		if w.Code != 503 || strings.Contains(w.Body.String(), "private database") {
			t.Fatalf("status=%d body=%s", w.Code, w.Body.String())
		}
	}
}
