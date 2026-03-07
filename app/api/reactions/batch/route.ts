import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabaseServer";
import type { ReactionType } from "@/lib/types";

// GET /api/reactions/batch?ids=id1,id2,...
// Returns counts + user's reaction for multiple posts in one shot
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json({ data: {} });

  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all reactions for these posts
  const { data: rows } = await admin
    .from("reactions")
    .select("post_id, user_id, reaction_type")
    .in("post_id", ids);

  // Build counts + user reaction map
  const data: Record<string, {
    counts: { not_slop: number; slop: number; filthy: number; garbage: number; total: number };
    userReaction: ReactionType | null;
  }> = {};

  for (const id of ids) {
    data[id] = { counts: { not_slop: 0, slop: 0, filthy: 0, garbage: 0, total: 0 }, userReaction: null };
  }

  for (const r of rows ?? []) {
    const entry = data[r.post_id];
    if (!entry) continue;
    entry.counts[r.reaction_type as ReactionType]++;
    entry.counts.total++;
    if (user && r.user_id === user.id) {
      entry.userReaction = r.reaction_type as ReactionType;
    }
  }

  return NextResponse.json({ data });
}
