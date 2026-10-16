/*
# Add TinyFish API key column to settings

1. Modified Tables
- `settings` - Add `tinyfish_api_key` (text, nullable) column for storing the TinyFish API key.
  Also add `active_provider` (text, default 'tinyfish') to track which provider is active.
2. Security
- No changes to RLS (existing policies already allow anon + authenticated CRUD).
*/

ALTER TABLE settings ADD COLUMN IF NOT EXISTS tinyfish_api_key text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS active_provider text DEFAULT 'tinyfish';
