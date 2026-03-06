import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabaseServer";
import type { Post } from "@/lib/types";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const challengeId = searchParams.get("challenge_id");

  if (!challengeId) {
    return NextResponse.json({ error: "challenge_id required." }, { status: 400 });
  }

  try {
    const admin = createAdminSupabase();

    const { data: posts, error } = await admin.rpc("get_challenge_posts", {
      p_challenge_id: challengeId,
      p_limit: 25,
      p_offset: offset,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
    }

    return NextResponse.json({ posts: (posts ?? []) as Post[] });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
