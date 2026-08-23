CREATE TABLE offers (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0 AND amount_cents <= 100000000000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','withdrawn','completed','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at TEXT,
  declined_at TEXT,
  withdrawn_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  CHECK (buyer_id <> seller_id)
);

CREATE INDEX offers_listing_status_idx
  ON offers(listing_id, status, created_at DESC);

CREATE INDEX offers_buyer_status_idx
  ON offers(buyer_id, status, created_at DESC);

CREATE INDEX offers_seller_status_idx
  ON offers(seller_id, status, created_at DESC);

CREATE UNIQUE INDEX offers_one_pending_per_buyer_idx
  ON offers(listing_id, buyer_id)
  WHERE status = 'pending';

CREATE UNIQUE INDEX offers_one_accepted_per_listing_idx
  ON offers(listing_id)
  WHERE status = 'accepted';
