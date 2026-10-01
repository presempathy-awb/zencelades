CREATE TABLE IF NOT EXISTS zencelades_account_scenarios (
    owner_subject text PRIMARY KEY CHECK (length(owner_subject) BETWEEN 1 AND 256),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision BETWEEN 1 AND 9007199254740991),
    scenario jsonb NOT NULL CHECK (
        jsonb_typeof(scenario) = 'object'
        AND scenario ? 'schema'
        AND scenario->'schema' = '1'::jsonb
        AND octet_length(scenario::text) <= 100000
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
