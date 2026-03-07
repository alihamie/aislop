"use client";

import { useState } from "react";

interface SlopStampButtonProps {
  postId: string;
  score: number;
  roast: string;
}

async function copyStampImage(postId: string): Promise<"copied" | "shared" | "downloaded"> {
  const url = `/api/stamp/${postId}`;

  try {
    const blob = await fetch(url).then((r) => r.blob());
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "copied";
  } catch { /* fall through */ }

  try {
    const blob = await fetch(url).then((r) => r.blob());
    const file = new File([blob], "slop-stamp.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Slop Stamp" });
      return "shared";
    }
  } catch { /* fall through */ }

  window.open(url, "_blank");
  return "downloaded";
}

export function SlopStampButton({ postId }: SlopStampButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [resultLabel, setResultLabel] = useState("Stamped!");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "loading") return;
    setStatus("loading");
    const result = await copyStampImage(postId);
    setResultLabel(result === "copied" ? "Image Copied!" : result === "shared" ? "Shared!" : "Saved!");
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
        disabled={status === "loading"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-sm font-bold transition-all border cursor-pointer ${
          status === "done"
            ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50"
            : status === "loading"
            ? "bg-zinc-800 text-zinc-500 border-zinc-700 animate-pulse"
            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40"
        }`}
        title="Copy Slop Stamp image"
      >
        <span>{status === "done" ? "✅" : "🗑️"}</span>
        <span>{status === "done" ? resultLabel : status === "loading" ? "Stamping..." : "Slop Stamp"}</span>
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center px-2.5 py-1.5 rounded-r-lg text-sm font-bold bg-zinc-800 text-zinc-400 border border-l-0 border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400 hover:border-yellow-400/40 transition-all cursor-pointer"
        title="Open stamp image"
      >
        ⬇
      </button>
    </div>
  );
}
