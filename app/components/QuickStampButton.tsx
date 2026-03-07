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

export function QuickStampButton({ postId }: QuickStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleStamp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    const imageUrl = `/api/stamp/${postId}`;

    try {
      const blob = await fetch(imageUrl).then((r) => r.blob());
      const file = new File([blob], "slop-stamp.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "AI Slop Certified" });
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2000);
        return;
      }
    } catch { /* fall through */ }

    // Desktop fallback: open image
    window.open(imageUrl, "_blank");
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      onClick={handleStamp}
      title="Share Slop Stamp"
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
        status === "done"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400"
          : status === "loading"
          ? "text-zinc-500 bg-zinc-800 border-zinc-700 animate-pulse"
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
