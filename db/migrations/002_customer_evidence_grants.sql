CREATE TABLE IF NOT EXISTS customer_evidence_grants (
  customer_access_id TEXT NOT NULL REFERENCES customer_access(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (customer_access_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_evidence_grants_evidence ON customer_evidence_grants(evidence_id);
