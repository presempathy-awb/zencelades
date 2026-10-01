package main

import "testing"

func TestConfigurationBoundary(t *testing.T) {
	for _, tc := range []struct {
		name, listen, origin, outpost string
		valid                         bool
	}{
		{"loopback", "127.0.0.1:12345", "https://art.example", "http://127.0.0.1:9000/outpost.goauthentik.io/auth/traefik", true},
		{"public listener", "0.0.0.0:12345", "https://art.example", "http://127.0.0.1:9000/auth", false},
		{"missing port", "127.0.0.1", "https://art.example", "http://127.0.0.1:9000/auth", false},
		{"insecure public origin", "127.0.0.1:12345", "http://art.example", "http://127.0.0.1:9000/auth", false},
		{"origin path", "127.0.0.1:12345", "https://art.example/app", "http://127.0.0.1:9000/auth", false},
		{"origin credentials", "127.0.0.1:12345", "https://person:password@art.example", "http://127.0.0.1:9000/auth", false},
		{"remote plaintext outpost", "127.0.0.1:12345", "https://art.example", "http://auth.example/auth", false},
		{"local development", "[::1]:12345", "http://127.0.0.1:12345", "http://127.0.0.1:9000/auth", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if (validateAddresses(tc.listen, tc.origin, tc.outpost) == nil) != tc.valid {
				t.Fatal("unexpected configuration acceptance")
			}
		})
	}
}
