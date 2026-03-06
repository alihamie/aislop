import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabaseServer";
import type { Challenge, Post } from "@/lib/types";

export const revalidate = 0;

export async function GET() {
  try {
    const admin = createAdminSupabase();

    // Get or create this week's challenge
    const { data: challengeRows, error: challengeError } = await admin.rpc(
      "get_or_create_current_challenge"
    );

    if (challengeError || !challengeRows || challengeRows.length === 0) {
      return NextResponse.json(
        { error: "Failed to load this week's challenge." },
        { status: 500 }
      );
    }

    const challenge = challengeRows[0] as Challenge;

    // Fetch first page of posts for this challenge
    const { data: posts, error: postsError } = await admin.rpc(
      "get_challenge_posts",
      {
        p_challenge_id: challenge.id,
        p_limit: 25,
        p_offset: 0,
      }
    );

    if (postsError) {
      return NextResponse.json(
        { error: "Failed to load challenge posts." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      challenge,
      posts: (posts ?? []) as Post[],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
