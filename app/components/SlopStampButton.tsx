"use client";

import { useState } from "react";

interface SlopStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

function getTierName(score: number): string {
  if (score <= 20) return "BARELY SLOP";
  if (score <= 40) return "CERTIFIED SLOP";
  if (score <= 60) return "PREMIUM GARBAGE";
  if (score <= 80) return "WEAPONS-GRADE SLOP";
  return "LEGENDARY FILTH";
}

function getTierEmoji(score: number): string {
  if (score <= 20) return "😬";
  if (score <= 40) return "🗑️";
  if (score <= 60) return "💩";
  if (score <= 80) return "☣️";
  return "👑";
}

function makeTextStamp(tierName: string, score: number, emoji: string, roast: string, url: string): string {
  const sep = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  return [sep, `${emoji}  ${tierName} — ${score}%`, "", `"${roast}"`, "", `✅ AI Slop Certified | ${url}`, sep].join("\n");
}

export function SlopStampButton({ postId, score, roast }: SlopStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [label, setLabel] = useState("Slop Stamp");

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "loading") return;
    setStatus("loading");

    const imageUrl = `/api/stamp/${postId}`;

    try {
      const blob = await fetch(imageUrl).then((r) => r.blob());
      const file = new File([blob], "slop-stamp.png", { type: "image/png" });

      // Mobile: share image via native share sheet
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "AI Slop Certified", url: `https://aislophub.ai/post/${postId}`, text: "AI Slop Certified 🗑️" });
        setLabel("Shared!");
        setStatus("done");
        setTimeout(() => { setStatus("idle"); setLabel("Slop Stamp"); }, 2500);
        return;
      }
    } catch { /* fall through */ }

    // Desktop: open image in new tab
    window.open(`/api/stamp/${postId}`, "_blank");
    setLabel("Opened!");
    setStatus("done");
    setTimeout(() => { setStatus("idle"); setLabel("Slop Stamp"); }, 2500);
  };

  const handleCopyText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tierName = getTierName(score);
    const emoji = getTierEmoji(score);
    const url = `aislophub.ai/post/${postId}`;
    const stamp = makeTextStamp(tierName, score, emoji, roast, url);
    try { await navigator.clipboard.writeText(stamp); } catch { /* ignore */ }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Image stamp */}
      <button
        onClick={handleShare}
        disabled={status === "loading"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-sm font-bold transition-all border cursor-pointer ${
          status === "done"
            ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50"
            : status === "loading"
            ? "bg-zinc-800 text-zinc-500 border-zinc-700 animate-pulse"
            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40"
        }`}
        title="Share Slop Stamp image"
      >
        <span>{status === "done" ? "✅" : "🗑️"}</span>
        <span>{status === "loading" ? "Loading..." : "Image"}</span>
      </button>

      {/* Text stamp */}
      <button
        onClick={handleCopyText}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-r-lg text-sm font-bold bg-zinc-800 text-zinc-400 border border-l-0 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40 transition-all cursor-pointer"
        title="Copy text stamp"
      >
        <span>📋</span>
        <span>Text</span>
      </button>
    </div>
  );
}
