"use client";

import { useState } from "react";

interface SlopStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

function getTierEmoji(score: number): string {
  if (score <= 20) return "😬";
  if (score <= 40) return "🗑️";
  if (score <= 60) return "💩";
  if (score <= 80) return "☣️";
  return "👑";
}

function getTierName(score: number): string {
  if (score <= 20) return "BARELY SLOP";
  if (score <= 40) return "CERTIFIED SLOP";
  if (score <= 60) return "PREMIUM GARBAGE";
  if (score <= 80) return "WEAPONS-GRADE SLOP";
  return "LEGENDARY FILTH";
}

function makeAsciiStamp(tierName: string, score: number, emoji: string, roast: string, url: string): string {
  const sep = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  const lines = [
    sep,
    `${emoji}  ${tierName} — ${score}%`,
    "",
    `"${roast}"`,
    "",
    `✅ AI Slop Certified | ${url}`,
    sep,
  ];
  return lines.join("\n");
}

export function SlopStampButton({ postId, score, roast }: SlopStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tierName = getTierName(score);
    const emoji = getTierEmoji(score);
    const url = `aislop.com/post/${postId.slice(0, 8)}`;
    const stamp = makeAsciiStamp(tierName, score, emoji, roast, url);
    try {
      await navigator.clipboard.writeText(stamp);
    } catch { /* ignore */ }

    if (navigator.share) {
      try {
        await navigator.share({ text: stamp });
      } catch { /* user dismissed */ }
    }

    setStatus("done");
    setTimeout(() => setStatus("idle"), 2500);
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
          status === "done"
            ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50"
            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40"
        }`}
        title="Copy Slop Stamp"
      >
        <span>{status === "done" ? "✅" : "🗑️"}</span>
        <span>{status === "done" ? "Stamp Copied!" : "Slop Stamp"}</span>
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
