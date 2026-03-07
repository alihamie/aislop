"use client";

import { useState } from "react";
import { getSlopTier } from "@/lib/types";

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

function makeAsciiStamp(tier: string, score: number, emoji: string, roast: string, url: string): string {
  const W = 42;
  const inner = W - 2;

  function pad(text: string): string {
    const t = text.slice(0, inner - 2);
    const spaces = inner - t.length;
    const left = Math.floor(spaces / 2);
    const right = spaces - left;
    return "║" + " ".repeat(left) + t + " ".repeat(right) + "║";
  }

  function wordWrap(text: string, maxW: number): string[] {
    const words = text.split(" ");
    const result: string[] = [];
    let line = "";
    for (const word of words) {
      if ((line + " " + word).trim().length <= maxW) {
        line = (line + " " + word).trim();
      } else {
        if (line) result.push(line);
        line = word;
      }
    }
    if (line) result.push(line);
    return result;
  }

  const border = "═".repeat(inner);
  const roastWrapped = wordWrap(`"${roast}"`, inner - 4);
  const lines = [
    "╔" + border + "╗",
    pad(""),
    pad(`${emoji}  ${tier}`),
    pad(`${score}%`),
    pad(""),
    ...roastWrapped.map(pad),
    pad(""),
    pad(`🗑️ ${url}`),
    pad(""),
    "╚" + border + "╝",
  ];
  return lines.join("\n");
}

export function SlopStampButton({ postId, score, roast }: SlopStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tier = getSlopTier(score);
    const emoji = getTierEmoji(score);
    const url = `${window.location.origin}/post/${postId}`;
    const stamp = makeAsciiStamp(tier, score, emoji, roast, url);
    try {
      await navigator.clipboard.writeText(stamp);
    } catch { /* ignore */ }
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
