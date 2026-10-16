/*
# Create chat_history table for Alberto AI conversations

1. New Tables
- `chat_history`
  - `id` (uuid, primary key)
  - `session_id` (text, identifies a conversation session)
  - `role` (text: 'user' or 'assistant')
  - `content` (text, the message content)
  - `tool_logs` (jsonb, array of tool usage logs from Alberto)
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `chat_history`.
- Single-tenant app (no auth) — allow anon + authenticated full CRUD.
- Data is intentionally shared/public across sessions.

3. Indexes
- Index on `session_id` for fast session lookups.
- Index on `created_at` for ordering.
*/

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tool_logs jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_history" ON chat_history;
CREATE POLICY "anon_select_chat_history" ON chat_history FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_history" ON chat_history;
CREATE POLICY "anon_insert_chat_history" ON chat_history FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_history" ON chat_history;
CREATE POLICY "anon_delete_chat_history" ON chat_history FOR DELETE
TO anon, authenticated USING (true);
