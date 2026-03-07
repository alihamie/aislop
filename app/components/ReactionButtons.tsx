"use client";

import { useState, useEffect } from "react";
import type { ReactionType, ReactionCounts } from "@/lib/types";

const REACTIONS: { type: ReactionType; emoji: string; label: string; weight: number }[] = [
  { type: "slop",     emoji: "🗑️", label: "Slop",     weight: 100 },
  { type: "not_slop", emoji: "🙅", label: "Not Slop", weight: 0   },
];

interface ReactionButtonsProps {
  postId: string;
  counts: ReactionCounts;
  userReaction: ReactionType | null;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export function ReactionButtons({
  postId,
  counts: initialCounts,
  userReaction: initialUserReaction,
  isAuthenticated,
  onAuthRequired,
}: ReactionButtonsProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
  const [loading, setLoading] = useState(false);

  // Sync when parent fetches fresh data (e.g. PostDetailClient loading counts async)
  useEffect(() => { setCounts(initialCounts); }, [initialCounts.total]);
  useEffect(() => { setUserReaction(initialUserReaction); }, [initialUserReaction]);

  const handleReact = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (!isAuthenticated) { onAuthRequired(); return; }
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prev = userReaction;
    const prevCounts = { ...counts };

    const newCounts = { ...counts };
    if (prev) newCounts[prev] = Math.max(0, newCounts[prev] - 1);
    if (prev !== type) {
      newCounts[type]++;
      newCounts.total = prev ? counts.total : counts.total + 1;
      setUserReaction(type);
    } else {
      newCounts.total = Math.max(0, counts.total - 1);
      setUserReaction(null);
    }
    setCounts(newCounts);

    try {
      await fetch(`/api/reactions/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: type }),
      });
    } catch {
      // Revert on error
      setCounts(prevCounts);
      setUserReaction(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">🏛 Do you agree with the judge?</p>
      <div className="grid grid-cols-2 gap-1.5 w-full">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts[type];
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            onClick={(e) => handleReact(e, type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border ${
              isActive
                ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/60 scale-[1.02]"
                : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700 hover:text-zinc-200 hover:border-zinc-600"
            }`}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="flex-1 text-left text-xs">{label}</span>
            <span className={`text-xs font-black ${isActive ? "text-yellow-400" : "text-zinc-600"}`}>
              {count}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
