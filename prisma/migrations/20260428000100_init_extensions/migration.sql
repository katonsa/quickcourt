-- Required before the initial schema:
-- - pgcrypto provides gen_random_uuid()
-- - citext backs User.email case-insensitive uniqueness
-- - btree_gist lets exclusion constraints compare UUID court_id with =
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
