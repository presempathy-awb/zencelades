package main

import (
	"bytes"
	"encoding/json"
	"io"
	"unicode/utf8"
)

func decodeStrict(body []byte, destination any) error {
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		if err != nil {
			return err
		}
		return &json.SyntaxError{}
	}
	return nil
}

// The service stores private versioned snapshots, not executable calculations.
// It checks the envelope and size; the cockpit's parseScenario remains responsible
// for domain validation before a snapshot is applied to models, prices or tasks.
func validSnapshot(raw json.RawMessage) bool {
	if len(raw) == 0 || len(raw) > 50000 || !utf8.Valid(raw) {
		return false
	}
	var fields map[string]json.RawMessage
	if json.Unmarshal(raw, &fields) != nil || fields == nil {
		return false
	}
	var schema int
	var selected, note string
	var haze bool
	if json.Unmarshal(fields["schema"], &schema) != nil || schema != 1 ||
		json.Unmarshal(fields["selected"], &selected) != nil || selected == "" || len(selected) > 128 ||
		json.Unmarshal(fields["note"], &note) != nil || utf8.RuneCountInString(note) > 4000 ||
		json.Unmarshal(fields["haze"], &haze) != nil || bytes.Equal(fields["haze"], []byte("null")) {
		return false
	}
	for _, key := range []string{"settings", "allowances", "funding", "board", "parts"} {
		var object map[string]json.RawMessage
		if json.Unmarshal(fields[key], &object) != nil || object == nil {
			return false
		}
	}
	return !bytes.Equal(fields["note"], []byte("null"))
}
