"use client";

import { useState } from "react";
import { getSlopTier } from "@/lib/types";

interface SlopStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

export function SlopStampButton({ postId, score, roast }: SlopStampButtonProps) {
  const [copied, setCopied] = useState(false);

  const tier = getSlopTier(score);
  const maxRoastLen = 200;
  const truncatedRoast = roast.length > maxRoastLen ? roast.slice(0, maxRoastLen - 1) + "…" : roast;
  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/post/${postId}`
    : `https://aislop-eight.vercel.app/post/${postId}`;

  const stampText = `${tier} — ${score}%\n\n"${truncatedRoast}"\n\n🗑️ ${postUrl}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(stampText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/stamp/${postId}`, "_blank");
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-sm font-bold transition-all border cursor-pointer ${
          copied
            ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50"
            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40"
        }`}
        title="Copy Slop Stamp text"
      >
        <span>{copied ? "✅" : "🗑️"}</span>
        <span>{copied ? "Stamped!" : "Slop Stamp"}</span>
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center px-2.5 py-1.5 rounded-r-lg text-sm font-bold bg-zinc-800 text-zinc-400 border border-l-0 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40 transition-all cursor-pointer"
        title="Download stamp image"
      >
        ⬇
      </button>
    </div>
  );
}
