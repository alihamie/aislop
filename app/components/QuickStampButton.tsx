"use client";

import { useState } from "react";

interface QuickStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

function StampIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="2" width="6" height="5" rx="1.5" />
      <rect x="10.5" y="7" width="3" height="3" />
      <rect x="4" y="10" width="16" height="5" rx="1.5" />
      <rect x="3" y="17" width="18" height="2.5" rx="1" opacity="0.5" />
    </svg>
  );
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
    pad(`${emoji}  ${tierName}`),
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

export function QuickStampButton({ postId, score, roast }: QuickStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  const handleStamp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const tierName = getTierName(score);
    const emoji = getTierEmoji(score);
    const url = `aislop.com/post/${postId.slice(0, 8)}`;
    const stamp = makeAsciiStamp(tierName, score, emoji, roast, url);

    try {
      await navigator.clipboard.writeText(stamp);
    } catch { /* ignore */ }

    setStatus("done");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      onClick={handleStamp}
      title="Copy Slop Stamp"
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
        status === "done"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400"
          : "text-zinc-300 bg-zinc-800 border-zinc-600 hover:text-yellow-400 hover:border-yellow-400 hover:bg-yellow-400/10"
      }`}
    >
      {status === "done"
        ? <span className="text-[9px] font-black leading-none">✓</span>
        : <StampIcon className="w-5 h-5 shrink-0" />
      }
    </button>
  );
}
