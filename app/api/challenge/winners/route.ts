import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabaseServer";
import type { ChallengeWithWinner } from "@/lib/types";

export const revalidate = 0;

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  try {
    const admin = createAdminSupabase();

    // Fetch past challenges (week_start before this week's Monday)
    const { data: challenges, error: challengesError } = await admin
      .from("challenges")
      .select("*")
      .lt("week_start", new Date(getThisMonday()).toISOString().slice(0, 10))
      .order("week_start", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (challengesError) {
      return NextResponse.json(
        { error: "Failed to load past challenges." },
        { status: 500 }
      );
    }

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ challenges: [] });
    }

    // Finalize winners for any challenge that doesn't have one yet
    await Promise.all(
      challenges
        .filter((c) => !c.winner_post_id)
        .map((c) =>
          admin.rpc("finalize_challenge_winner", { p_challenge_id: c.id })
        )
    );

    // Re-fetch after finalizing
    const { data: finalized, error: finalizedError } = await admin
      .from("challenges")
      .select("*")
      .in(
        "id",
        challenges.map((c) => c.id)
      )
      .order("week_start", { ascending: false });

    if (finalizedError) {
      return NextResponse.json(
        { error: "Failed to reload challenges." },
        { status: 500 }
      );
    }

    // Collect winner post IDs to fetch
    const winnerPostIds = (finalized ?? [])
      .map((c) => c.winner_post_id)
      .filter(Boolean) as string[];

    let winnerPostsMap: Record<string, object> = {};
    if (winnerPostIds.length > 0) {
      const { data: winnerPosts } = await admin
        .from("posts")
        .select("*, profiles(username)")
        .in("id", winnerPostIds);

      if (winnerPosts) {
        winnerPostsMap = Object.fromEntries(winnerPosts.map((p) => [p.id, p]));
      }
    }

    const result: ChallengeWithWinner[] = (finalized ?? []).map((c) => ({
      ...c,
      winner_post: c.winner_post_id ? winnerPostsMap[c.winner_post_id] ?? null : null,
    }));

    return NextResponse.json({
      challenges: result,
      hasMore: (finalized ?? []).length >= PAGE_SIZE,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/** Returns a JS Date set to the most recent Monday at 00:00 UTC */
function getThisMonday(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diffDays = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffDays)
  );
  return monday;
}
