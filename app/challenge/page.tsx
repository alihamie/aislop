import { createAdminSupabase } from "@/lib/supabaseServer";
import { WeeklyChallengeClient } from "@/app/components/WeeklyChallengeClient";
import type { Challenge, Post } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Weekly Challenge — AI Slop",
  description: "Submit your sloppiest AI content for this week's themed challenge. Best net votes wins.",
};

export default async function ChallengePage() {
  const admin = createAdminSupabase();

  // Get or create this week's challenge (idempotent RPC)
  const { data: challengeRows, error: challengeError } = await admin.rpc(
    "get_or_create_current_challenge"
  );

  if (challengeError || !challengeRows || challengeRows.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <div className="text-5xl mb-4">❌</div>
        <p className="font-bold text-lg">Failed to load this week&apos;s challenge.</p>
        <p className="text-sm mt-1 text-zinc-700">{challengeError?.message}</p>
      </div>
    );
  }

  const challenge = challengeRows[0] as Challenge;

  // Fetch first page of ranked entries
  const { data: posts } = await admin.rpc("get_challenge_posts", {
    p_challenge_id: challenge.id,
    p_limit: 25,
    p_offset: 0,
  });

  return (
    <WeeklyChallengeClient
      initialChallenge={challenge}
      initialPosts={(posts ?? []) as Post[]}
    />
  );
}
