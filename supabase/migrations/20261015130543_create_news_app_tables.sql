/*
# Create tables for Ground Truth news aggregator

1. New Tables
- `bookmarks` - Stores user-saved articles for later reading
  - id (uuid, primary key)
  - title (text, not null)
  - summary (text)
  - link (text, not null)
  - source_name (text)
  - source_bias (text)
  - category (text)
  - published_at (text)
  - thumbnail (text)
  - created_at (timestamp)
- `settings` - Stores app settings (single-row config table)
  - id (int, primary key, always 1)
  - firecrawl_api_key (text, nullable)
  - preferred_categories (text array, nullable)
  - show_bias_ratings (boolean, default true)
  - created_at (timestamp)
  - updated_at (timestamp)

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because this is a single-tenant app with no sign-in.
- All data is intentionally public/shared within the app instance.
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  link text NOT NULL,
  source_name text,
  source_bias text,
  category text,
  published_at text,
  thumbnail text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookmarks" ON bookmarks;
CREATE POLICY "anon_select_bookmarks" ON bookmarks FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookmarks" ON bookmarks;
CREATE POLICY "anon_insert_bookmarks" ON bookmarks FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookmarks" ON bookmarks;
CREATE POLICY "anon_update_bookmarks" ON bookmarks FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookmarks" ON bookmarks;
CREATE POLICY "anon_delete_bookmarks" ON bookmarks FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  firecrawl_api_key text,
  preferred_categories text[],
  show_bias_ratings boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
TO anon, authenticated USING (true);

INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;
