-- Canonical schema. Idempotent: `npm run db:init` re-applies it safely.
-- Auth accounts and sessions live in the `neon_auth` schema, managed by Neon
-- Auth — not here.

-- Auto-provisioned app identity for every authenticated Neon Auth user.
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Per-list membership: the owner is a member too, so reads JOIN this one table.
CREATE TABLE IF NOT EXISTS list_members (
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, user_id)
);

-- Items are soft-deleted (deleted_at) so /stats survives list clean-ups.
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric,
  unit text NOT NULL DEFAULT 'szt',
  checked boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_items_list ON items(list_id) WHERE deleted_at IS NULL;

-- Per-list share links: a bearer token bound to one list.
CREATE TABLE IF NOT EXISTS invites (
  token text PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- items.updated_at drives the list version the refresh poller compares.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS items_set_updated_at ON items;
CREATE TRIGGER items_set_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
