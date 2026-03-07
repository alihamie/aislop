-- Reactions table: replaces up/down votes with weighted reactions
CREATE TABLE IF NOT EXISTS reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('not_slop', 'slop', 'filthy', 'garbage')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id) -- one reaction per user per post
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users insert own reaction" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reaction" ON reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reaction" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Update get_hot_posts to include reaction counts (drop old signature first)
DROP FUNCTION IF EXISTS get_hot_posts(integer, integer);

CREATE OR REPLACE FUNCTION get_hot_posts(p_limit integer DEFAULT 25, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid, user_id uuid, title text, content text, slop_score integer,
  verdict text, roast text, created_at timestamptz, challenge_id uuid, source_url text,
  username text,
  not_slop_count bigint, slop_count bigint, filthy_count bigint, garbage_count bigint,
  total_reactions bigint
) AS $$
  SELECT
    p.id, p.user_id, p.title, p.content, p.slop_score,
    p.verdict, p.roast, p.created_at, p.challenge_id, p.source_url,
    pr.username,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'not_slop') AS not_slop_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'slop')     AS slop_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'filthy')   AS filthy_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'garbage')  AS garbage_count,
    COUNT(r.id)                                              AS total_reactions
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN reactions r ON r.post_id = p.id
  GROUP BY p.id, pr.username
  ORDER BY (
    (
      COUNT(r.id) FILTER (WHERE r.reaction_type = 'slop')    * 1 +
      COUNT(r.id) FILTER (WHERE r.reaction_type = 'filthy')  * 2 +
      COUNT(r.id) FILTER (WHERE r.reaction_type = 'garbage') * 3
    ) / NULLIF((EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2) ^ 1.5, 0)
  ) DESC NULLS LAST, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;

-- Update get_challenge_posts similarly
DROP FUNCTION IF EXISTS get_challenge_posts(uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_challenge_posts(p_challenge_id uuid, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid, user_id uuid, title text, content text, slop_score integer,
  verdict text, roast text, created_at timestamptz, challenge_id uuid, source_url text,
  username text,
  not_slop_count bigint, slop_count bigint, filthy_count bigint, garbage_count bigint,
  total_reactions bigint
) AS $$
  SELECT
    p.id, p.user_id, p.title, p.content, p.slop_score,
    p.verdict, p.roast, p.created_at, p.challenge_id, p.source_url,
    pr.username,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'not_slop') AS not_slop_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'slop')     AS slop_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'filthy')   AS filthy_count,
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'garbage')  AS garbage_count,
    COUNT(r.id)                                              AS total_reactions
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN reactions r ON r.post_id = p.id
  WHERE p.challenge_id = p_challenge_id
  GROUP BY p.id, pr.username
  ORDER BY (
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'slop')    * 1 +
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'filthy')  * 2 +
    COUNT(r.id) FILTER (WHERE r.reaction_type = 'garbage') * 3
  ) DESC NULLS LAST, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;
