CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invites (
  token text PRIMARY KEY,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE items ADD COLUMN IF NOT EXISTS quantity numeric;
ALTER TABLE items ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'szt';
ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_items_list ON items(list_id) WHERE deleted_at IS NULL;

-- Per-list membership: the owner is a member too, so reads JOIN this single table.
CREATE TABLE IF NOT EXISTS list_members (
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, user_id)
);

-- Backfill: every existing list's creator becomes a member of that list.
INSERT INTO list_members (list_id, user_id)
SELECT id, created_by FROM lists WHERE created_by IS NOT NULL
ON CONFLICT DO NOTHING;

-- Invites are now per-list share links (bearer token bound to one list).
ALTER TABLE invites ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES lists(id) ON DELETE CASCADE;
DELETE FROM invites WHERE list_id IS NULL;
ALTER TABLE invites ALTER COLUMN list_id SET NOT NULL;

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
