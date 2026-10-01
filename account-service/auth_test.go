package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOutpostIdentity(t *testing.T) {
	for _, tc := range []struct {
		name          string
		status        int
		uid, username string
		want          bool
		fail          bool
	}{
		{"verified", 204, "stable-id", "artist", true, false},
		{"anonymous", 401, "", "", false, false},
		{"denied", 403, "stable-id", "artist", false, true},
		{"redirect", 302, "stable-id", "artist", false, false},
		{"outage", 503, "", "", false, true},
		{"missing subject", 204, "", "artist", false, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			outpost := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Header.Get("X-authentik-username") != "" || r.Header.Get("Authorization") != "" {
					t.Error("forwarded caller identity")
				}
				if r.Header.Get("Cookie") != "test-cookie" || r.Header.Get("X-Forwarded-Host") != "art.example" {
					t.Error("wrong auth request")
				}
				w.Header().Set("X-authentik-uid", tc.uid)
				w.Header().Set("X-authentik-username", tc.username)
				w.Header().Set("Location", "https://outside.invalid/")
				w.WriteHeader(tc.status)
			}))
			defer outpost.Close()
			auth := outpostAuth{endpoint: outpost.URL, origin: "https://art.example", client: authClient()}
			r := httptest.NewRequest("GET", "/account/api/session", nil)
			r.Header.Set("Cookie", "test-cookie")
			r.Header.Set("X-authentik-username", "forged")
			r.Header.Set("Authorization", "Bearer forged")
			who, err := auth.verify(context.Background(), r)
			if (who != nil) != tc.want || (err != nil) != tc.fail {
				t.Fatalf("identity=%v error=%v", who, err)
			}
			if who != nil && (who.ID != "stable-id" || who.Username != "artist") {
				t.Fatal("wrong principal")
			}
		})
	}
}
