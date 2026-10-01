package main

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/url"
	"time"

	"git.telpher.stream/telpher/gimmesomepaw.git/identity"
)

type principal struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}
type outpostAuth struct {
	endpoint, origin string
	client           *http.Client
}

func authClient() *http.Client {
	return &http.Client{Timeout: 5 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
}

// verify trusts only the configured outpost response, never browser identity headers.
func (a outpostAuth) verify(ctx context.Context, incoming *http.Request) (*principal, error) {
	origin, err := url.Parse(a.origin)
	if err != nil || origin.Host == "" {
		return nil, errors.New("invalid authentication origin")
	}
	r, err := http.NewRequestWithContext(ctx, http.MethodGet, a.endpoint, nil)
	if err != nil {
		return nil, errors.New("invalid outpost endpoint")
	}
	r.Host = origin.Host
	r.Header.Set("X-Forwarded-Host", origin.Host)
	r.Header.Set("X-Forwarded-Proto", origin.Scheme)
	r.Header.Set("X-Forwarded-Uri", "/account/api/session")
	r.Header.Set("X-Forwarded-Method", "GET")
	r.Header.Set("Cookie", incoming.Header.Get("Cookie"))
	response, err := a.client.Do(r)
	if err != nil {
		return nil, errors.New("identity service unavailable")
	}
	read, readErr := io.Copy(io.Discard, io.LimitReader(response.Body, 262145))
	closeErr := response.Body.Close()
	if readErr != nil || closeErr != nil || read > 262144 {
		return nil, errors.New("identity response incomplete")
	}
	if response.StatusCode == 401 || response.StatusCode == 302 || response.StatusCode == 303 {
		return nil, nil
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, errors.New("identity service denied or unavailable")
	}
	who := identity.From(response.Header, true)
	ids := response.Header.Values("X-authentik-uid")
	if who == nil || len(ids) != 1 || ids[0] == "" || len(ids[0]) > 256 || len(response.Header.Values("X-authentik-username")) != 1 {
		return nil, errors.New("identity response missing unique subject")
	}
	return &principal{ID: ids[0], Username: who.Username}, nil
}
