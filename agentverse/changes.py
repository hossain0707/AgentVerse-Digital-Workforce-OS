"""Database migration helper for additive schema changes in the local development MVP.

SQLite migration strategy: additive CREATE TABLE IF NOT EXISTS for new tables;
production-grade schema/versioned migrations and persistent backups are future work.
"""

ADDITIONAL_SCHEMA = '''
CREATE TABLE IF NOT EXISTS renewal_requests (
 id TEXT PRIMARY KEY, contract_id TEXT NOT NULL, requester_id TEXT NOT NULL,
 extra_months INTEGER NOT NULL CHECK(extra_months>0), quoted_credits INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),
 requested_at TEXT NOT NULL, decided_at TEXT,
 FOREIGN KEY(contract_id) REFERENCES contracts(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS only_one_pending_renewal
 ON renewal_requests(contract_id) WHERE status='pending';
CREATE TABLE IF NOT EXISTS buyout_offers (
 id TEXT PRIMARY KEY, contract_id TEXT NOT NULL, seller_id TEXT NOT NULL,
 amount INTEGER NOT NULL CHECK(amount>=100), status TEXT NOT NULL
 CHECK(status IN ('open','accepted','withdrawn','expired')),
 created_at TEXT NOT NULL, closed_at TEXT,
 FOREIGN KEY(contract_id) REFERENCES contracts(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_buyout
 ON buyout_offers(contract_id) WHERE status='open';
CREATE TABLE IF NOT EXISTS ownership_history (
 id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, previous_owner TEXT NOT NULL,
 new_owner TEXT NOT NULL, transfer_kind TEXT NOT NULL,
 price_credits INTEGER NOT NULL, happened_at TEXT NOT NULL,
 FOREIGN KEY(agent_id) REFERENCES agents(id)
);
'''