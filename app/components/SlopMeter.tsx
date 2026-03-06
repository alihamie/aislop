"use client";

import { getSlopTier } from "@/lib/types";

interface SlopMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

const SEGMENTS = 10;

function getSegmentColor(i: number, score: number): string {
  const threshold = ((i + 1) / SEGMENTS) * 100;
  if (threshold > score) return "bg-zinc-800";
  if (score <= 20) return "bg-zinc-500";
  if (score <= 40) return "bg-green-500";
  if (score <= 60) return "bg-yellow-400";
  if (score <= 80) return "bg-orange-500";
  return "bg-yellow-400";
}

function getSlopEmoji(score: number): string {
  if (score <= 20) return "😬";
  if (score <= 40) return "🗑️";
  if (score <= 60) return "💩";
  if (score <= 80) return "☣️";
  return "👑";
}

export function SlopMeter({
  score,
  size = "md",
  showLabel = true,
  animate = true,
}: SlopMeterProps) {
  const tier = getSlopTier(score);
  const emoji = getSlopEmoji(score);
  const isLegendary = score > 80;

  const segmentHeights = { sm: "h-2", md: "h-2.5", lg: "h-3" };
  const scoreSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  const labelSizes = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`font-black ${scoreSizes[size]} ${isLegendary ? "text-yellow-400" : "text-white"}`}>
            {score}%
          </span>
          <span className="text-base">{emoji}</span>
        </div>
        {showLabel && (
          <span className={`${labelSizes[size]} font-black uppercase tracking-widest text-zinc-400`}>
            {tier}
          </span>
        )}
      </div>

      {/* Segmented bar */}
      <div className="flex gap-0.5">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${segmentHeights[size]} rounded-sm ${getSegmentColor(i, score)} ${
              animate ? "transition-all duration-700" : ""
            } ${isLegendary && ((i + 1) / SEGMENTS) * 100 <= score ? "animate-pulse" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
