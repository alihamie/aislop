-- ============================================================
-- 005_source_url.sql
-- Adds source_url column to posts for link-back to original content
-- ============================================================
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS source_url text;
