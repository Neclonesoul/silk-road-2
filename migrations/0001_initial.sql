PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','removed')),
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0,1)),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent_hash TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(handle) BETWEEN 3 AND 30),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 2 AND 60),
  bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 500),
  avatar_key TEXT,
  locality TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  response_count INTEGER NOT NULL DEFAULT 0,
  response_seconds_total INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);

CREATE TABLE category_attributes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  attribute_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text','number','select','boolean')),
  required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0,1)),
  options_json TEXT,
  min_number REAL,
  max_number REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(category_id, attribute_key)
);

CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 4 AND 100),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 20 AND 5000),
  condition TEXT NOT NULL CHECK (condition IN ('new','like-new','good','fair','parts')),
  price_cents INTEGER NOT NULL CHECK (price_cents BETWEEN 0 AND 100000000000),
  price_negotiable INTEGER NOT NULL DEFAULT 0 CHECK (price_negotiable IN (0,1)),
  locality TEXT NOT NULL,
  region TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'ZA' CHECK (length(country_code) = 2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','reserved','sold','expired','removed')),
  moderation_reason TEXT,
  published_at TEXT,
  expires_at TEXT,
  sold_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE listing_attributes (
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  attribute_id TEXT NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IN (0,1)),
  PRIMARY KEY (listing_id, attribute_id),
  CHECK ((value_text IS NOT NULL) + (value_number IS NOT NULL) + (value_boolean IS NOT NULL) = 1)
);

CREATE TABLE listing_images (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp','image/avif')),
  bytes INTEGER NOT NULL CHECK (bytes > 0 AND bytes <= 10485760),
  width INTEGER,
  height INTEGER,
  alt_text TEXT NOT NULL DEFAULT '' CHECK (length(alt_text) <= 180),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  last_message_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (buyer_id <> seller_id),
  UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE TABLE conversation_members (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_message_id TEXT,
  last_read_at TEXT,
  left_at TEXT,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  delivered_at TEXT,
  read_at TEXT,
  removed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message','listing','moderation','account')),
  title TEXT NOT NULL CHECK (length(title) <= 140),
  body TEXT NOT NULL CHECK (length(body) <= 500),
  href TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing','user','message')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('prohibited','fraud','misleading','abusive','duplicate','other')),
  detail TEXT NOT NULL DEFAULT '' CHECK (length(detail) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE rate_limits (
  bucket TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, subject_hash, window_start)
);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  request_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX sessions_user_expires_idx ON sessions(user_id, expires_at);
CREATE INDEX listings_status_published_idx ON listings(status, published_at DESC);
CREATE INDEX listings_category_status_idx ON listings(category_id, status, published_at DESC);
CREATE INDEX listings_price_idx ON listings(status, price_cents);
CREATE INDEX listings_location_idx ON listings(region, locality, status);
CREATE INDEX listings_seller_status_idx ON listings(seller_id, status, updated_at DESC);
CREATE INDEX listing_images_listing_order_idx ON listing_images(listing_id, is_cover DESC, sort_order);
CREATE UNIQUE INDEX listing_images_one_cover_idx ON listing_images(listing_id) WHERE is_cover = 1;
CREATE INDEX conversations_buyer_idx ON conversations(buyer_id, last_message_at DESC);
CREATE INDEX conversations_seller_idx ON conversations(seller_id, last_message_at DESC);
CREATE INDEX messages_conversation_created_idx ON messages(conversation_id, created_at);
CREATE INDEX notifications_unread_idx ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX reports_status_created_idx ON reports(status, created_at DESC);
CREATE INDEX audit_target_idx ON audit_events(target_type, target_id, created_at DESC);

INSERT INTO categories (id, slug, name, icon, sort_order) VALUES
  ('vehicles','vehicles','Vehicles','car',10),
  ('electronics','electronics','Electronics','zap',20),
  ('phones-tablets','phones-tablets','Phones & Tablets','smartphone',30),
  ('computers','computers','Computers','laptop',40),
  ('gaming','gaming','Gaming','gamepad-2',50),
  ('home-garden','home-garden','Home & Garden','house',60),
  ('property','property','Property','building-2',70),
  ('fashion','fashion','Fashion','shirt',80),
  ('tools-equipment','tools-equipment','Tools & Equipment','wrench',90),
  ('sports-outdoors','sports-outdoors','Sports & Outdoors','bike',100),
  ('collectables','collectables','Collectables','gem',110),
  ('other','other','Other','package',120);

INSERT INTO category_attributes (id, category_id, attribute_key, label, field_type, required, options_json, min_number, max_number, sort_order) VALUES
  ('vehicle-make','vehicles','make','Make','text',1,NULL,NULL,NULL,10),
  ('vehicle-model','vehicles','model','Model','text',1,NULL,NULL,NULL,20),
  ('vehicle-year','vehicles','year','Year','number',1,NULL,1900,2100,30),
  ('vehicle-mileage','vehicles','mileage','Mileage (km)','number',0,NULL,0,2000000,40),
  ('vehicle-transmission','vehicles','transmission','Transmission','select',0,'["Manual","Automatic","CVT","Other"]',NULL,NULL,50),
  ('property-type','property','property_type','Property type','select',1,'["House","Apartment","Townhouse","Land","Commercial","Other"]',NULL,NULL,10),
  ('property-bedrooms','property','bedrooms','Bedrooms','number',0,NULL,0,100,20),
  ('property-bathrooms','property','bathrooms','Bathrooms','number',0,NULL,0,100,30),
  ('property-floor-area','property','floor_area','Floor area (m²)','number',0,NULL,0,10000000,40),
  ('phone-brand','phones-tablets','brand','Brand','text',1,NULL,NULL,NULL,10),
  ('phone-model','phones-tablets','model','Model','text',1,NULL,NULL,NULL,20),
  ('phone-storage','phones-tablets','storage','Storage','select',0,'["32 GB","64 GB","128 GB","256 GB","512 GB","1 TB","Other"]',NULL,NULL,30),
  ('computer-brand','computers','brand','Brand','text',0,NULL,NULL,NULL,10),
  ('computer-memory','computers','memory','Memory','text',0,NULL,NULL,NULL,20),
  ('fashion-size','fashion','size','Size','text',0,NULL,NULL,NULL,10);
