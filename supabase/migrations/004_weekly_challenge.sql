-- ============================================================
-- 004_weekly_challenge.sql
-- Adds weekly challenge feature:
--   - challenge_prompts  (seed data)
--   - challenges         (one row per week)
--   - posts.challenge_id (optional FK)
--   - RPCs for get/create, list posts, finalize winner
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Prompt library
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_prompts (
  id     serial PRIMARY KEY,
  prompt text NOT NULL
);

-- Seed 6 prompts (cycling weekly by ISO-week % 6)
INSERT INTO challenge_prompts (prompt) VALUES
  ('LinkedIn Humblebrag'),
  ('Reddit Slop'),
  ('Corporate Mission Statement'),
  ('Blog Post Intro'),
  ('About Us Page'),
  ('Tweet Slop')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. Challenges table  (one row per calendar week)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start     date        UNIQUE NOT NULL,   -- always Monday (DATE_TRUNC('week', ...))
  prompt         text        NOT NULL,
  winner_post_id uuid        REFERENCES posts(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_week_start ON challenges(week_start DESC);

-- ────────────────────────────────────────────────────────────
-- 3. Add challenge_id column to posts
-- ────────────────────────────────────────────────────────────
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS challenge_id uuid REFERENCES challenges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_challenge_id ON posts(challenge_id)
  WHERE challenge_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 4. RLS policies
-- ────────────────────────────────────────────────────────────
ALTER TABLE challenge_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read challenge_prompts" ON challenge_prompts;
CREATE POLICY "Public read challenge_prompts"
  ON challenge_prompts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read challenges" ON challenges;
CREATE POLICY "Public read challenges"
  ON challenges FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────
-- 5. RPC: get_or_create_current_challenge
--    Returns (or creates) the challenge row for the current week.
--    Week determined by DATE_TRUNC('week', CURRENT_DATE) which
--    gives the Monday of the current ISO week.
--    Prompt chosen by: ((ISO_WEEK - 1) % total_prompts) + 1
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_or_create_current_challenge()
RETURNS SETOF challenges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start  date;
  v_prompt_id   int;
  v_prompt      text;
  v_total       int;
BEGIN
  v_week_start := DATE_TRUNC('week', CURRENT_DATE)::date;

  -- Try fast-path: already exists
  IF EXISTS (SELECT 1 FROM challenges WHERE week_start = v_week_start) THEN
    RETURN QUERY SELECT * FROM challenges WHERE week_start = v_week_start;
    RETURN;
  END IF;

  -- Pick prompt by cycling ISO week number
  SELECT COUNT(*) INTO v_total FROM challenge_prompts;
  v_prompt_id := ((EXTRACT(WEEK FROM CURRENT_DATE)::int - 1) % v_total) + 1;
  SELECT prompt INTO v_prompt FROM challenge_prompts WHERE id = v_prompt_id;

  -- Insert (ignore conflict in case of race)
  INSERT INTO challenges (week_start, prompt)
  VALUES (v_week_start, v_prompt)
  ON CONFLICT (week_start) DO NOTHING;

  RETURN QUERY SELECT * FROM challenges WHERE week_start = v_week_start;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. RPC: get_challenge_posts
--    Returns posts for a challenge ordered by net votes desc.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_challenge_posts(
  p_challenge_id uuid,
  p_limit        int  DEFAULT 25,
  p_offset       int  DEFAULT 0
)
RETURNS TABLE (
  id             uuid,
  user_id        uuid,
  title          text,
  content        text,
  slop_score     int,
  verdict        text,
  roast          text,
  upvotes        int,
  downvotes      int,
  created_at     timestamptz,
  challenge_id   uuid,
  username       text,
  net_votes      int
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.content,
    p.slop_score,
    p.verdict,
    p.roast,
    p.upvotes,
    p.downvotes,
    p.created_at,
    p.challenge_id,
    pr.username,
    (p.upvotes - p.downvotes) AS net_votes
  FROM posts p
  LEFT JOIN profiles pr ON pr.id = p.user_id
  WHERE p.challenge_id = p_challenge_id
  ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at ASC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- ────────────────────────────────────────────────────────────
-- 7. RPC: finalize_challenge_winner
--    Writes the winner_post_id for a past week's challenge.
--    Idempotent: only runs if winner_post_id IS NULL and the
--    week has ended.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION finalize_challenge_winner(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start  date;
  v_winner_id   uuid;
BEGIN
  SELECT week_start INTO v_week_start
  FROM challenges
  WHERE id = p_challenge_id;

  -- Only finalize if the week is over and not yet set
  IF v_week_start IS NULL THEN RETURN; END IF;
  IF v_week_start >= DATE_TRUNC('week', CURRENT_DATE)::date THEN RETURN; END IF;

  SELECT winner_post_id INTO v_winner_id FROM challenges WHERE id = p_challenge_id;
  IF v_winner_id IS NOT NULL THEN RETURN; END IF;

  -- Find the top post by net votes (upvotes - downvotes), then earliest if tied
  SELECT p.id INTO v_winner_id
  FROM posts p
  WHERE p.challenge_id = p_challenge_id
  ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at ASC
  LIMIT 1;

  IF v_winner_id IS NOT NULL THEN
    UPDATE challenges SET winner_post_id = v_winner_id WHERE id = p_challenge_id;
  END IF;
END;
$$;
