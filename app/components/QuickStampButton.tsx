"use client";

import { useState } from "react";
import { getSlopTier } from "@/lib/types";

interface QuickStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

function StampIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Handle */}
      <rect x="9" y="2" width="6" height="5" rx="1.5" />
      {/* Neck */}
      <rect x="10.5" y="7" width="3" height="3" />
      {/* Base/pad */}
      <rect x="4" y="10" width="16" height="5" rx="1.5" />
      {/* Ink line */}
      <rect x="3" y="17" width="18" height="2.5" rx="1" opacity="0.5" />
    </svg>
  );
}

export function QuickStampButton({ postId, score, roast }: QuickStampButtonProps) {
  const [copied, setCopied] = useState(false);

  const tier = getSlopTier(score);
  const truncatedRoast = roast.length > 200 ? roast.slice(0, 199) + "…" : roast;
  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/post/${postId}`
    : `https://aislop-eight.vercel.app/post/${postId}`;

  const stampText = `${tier} — ${score}%\n\n"${truncatedRoast}"\n\n🗑️ ${postUrl}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(stampText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy Slop Stamp"
      className={`p-1.5 rounded-md transition-all cursor-pointer ${
        copied
          ? "text-yellow-400"
          : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {copied
        ? <span className="text-xs font-black">✓</span>
        : <StampIcon className="w-4 h-4" />
      }
    </button>
  );
}
