import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabaseServer";
import type { ReactionType } from "@/lib/types";

const VALID_TYPES: ReactionType[] = ["not_slop", "slop", "filthy", "garbage"];

// GET /api/reactions/[id] — counts + user's reaction
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminSupabase();
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: counts } = await admin
    .from("reactions")
    .select("reaction_type")
    .eq("post_id", id);

  const tally = { not_slop: 0, slop: 0, filthy: 0, garbage: 0, total: 0 };
  for (const r of counts ?? []) {
    tally[r.reaction_type as ReactionType]++;
    tally.total++;
  }

  let userReaction: ReactionType | null = null;
  if (user) {
    const { data: mine } = await admin
      .from("reactions")
      .select("reaction_type")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    userReaction = (mine?.reaction_type as ReactionType) ?? null;
  }

  return NextResponse.json({ counts: tally, userReaction });
}

// POST /api/reactions/[id] — submit or toggle off
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { reaction_type } = await req.json();
  if (!VALID_TYPES.includes(reaction_type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  // Check existing reaction
  const { data: existing } = await admin
    .from("reactions")
    .select("id, reaction_type")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction_type === reaction_type) {
      // Toggle off — remove reaction
      await admin.from("reactions").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed" });
    } else {
      // Change reaction type
      await admin.from("reactions").update({ reaction_type }).eq("id", existing.id);
      return NextResponse.json({ action: "updated", reaction_type });
    }
  }

  // New reaction
  await admin.from("reactions").insert({ post_id: id, user_id: user.id, reaction_type });
  return NextResponse.json({ action: "added", reaction_type });
}
