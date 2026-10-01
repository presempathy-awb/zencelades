CREATE TABLE IF NOT EXISTS zencelades_account_drafts (
    owner_subject text NOT NULL CHECK (length(owner_subject) BETWEEN 1 AND 256),
    document_kind text NOT NULL CHECK (document_kind IN ('scenario', 'naming')),
    revision bigint NOT NULL DEFAULT 1 CHECK (revision BETWEEN 1 AND 9007199254740991),
    document jsonb NOT NULL CHECK (
        jsonb_typeof(document) = 'object'
        AND document ? 'schema'
        AND document->'schema' = '1'::jsonb
        AND octet_length(document::text) <= CASE document_kind
            WHEN 'scenario' THEN 100000 ELSE 8388608 END
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (owner_subject, document_kind)
);
