"use client";

import { getSlopTier } from "@/lib/types";

interface TweetVerdictButtonProps {
  postId: string;
  score: number;
  roast: string;
  siteUrl?: string;
}

export function TweetVerdictButton({ postId, score, roast, siteUrl }: TweetVerdictButtonProps) {
  const tier = getSlopTier(score);
  const baseUrl = siteUrl ?? (typeof window !== "undefined" ? window.location.origin : "https://aislop-eight.vercel.app");
  const postUrl = `${baseUrl}/post/${postId}`;

  // Truncate roast to keep tweet under 280 chars
  const maxRoastLen = 160;
  const truncatedRoast = roast.length > maxRoastLen ? roast.slice(0, maxRoastLen - 1) + "…" : roast;

  const tweetText = `Just got rated ${tier} (${score}%) by the Slop Judge 🗑️\n\n"${truncatedRoast}"\n\n${postUrl}`;

  const handleTweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  return (
    <button
      onClick={handleTweet}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-zinc-800 hover:bg-[#1a1a2e] text-zinc-300 hover:text-[#1d9bf0] transition-all border border-zinc-700 hover:border-[#1d9bf0]/50 cursor-pointer"
    >
      𝕏 Tweet This
    </button>
  );
}
