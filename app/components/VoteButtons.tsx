"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { VoteType } from "@/lib/types";

interface VoteButtonsProps {
  postId: string;
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export function VoteButtons({
  postId,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  userVote: initialUserVote,
  isAuthenticated,
  onAuthRequired,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleVote = async (voteType: VoteType) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevUserVote = userVote;

    if (userVote === voteType) {
      // Toggle off
      setUserVote(null);
      if (voteType === "slop") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else if (userVote) {
      // Switch vote
      setUserVote(voteType);
      if (voteType === "slop") {
        setUpvotes((v) => v + 1);
        setDownvotes((v) => v - 1);
      } else {
        setDownvotes((v) => v + 1);
        setUpvotes((v) => v - 1);
      }
    } else {
      // New vote
      setUserVote(voteType);
      if (voteType === "slop") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, vote_type: voteType }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback
        setUpvotes(prevUpvotes);
        setDownvotes(prevDownvotes);
        setUserVote(prevUserVote);
        return;
      }

      // Sync with server counts
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.user_vote);
    } catch {
      // Rollback
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setUserVote(prevUserVote);
    } finally {
      setLoading(false);
    }
  };

  // Also sync props when they change (e.g., from parent re-fetch)
  // We intentionally use initialUpvotes/initialDownvotes only for initial state

  return (
    <div className="flex items-center gap-2">
      {/* Certified Slop (upvote) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote("slop");
        }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
          userVote === "slop"
            ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 scale-105"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-yellow-400"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span className="text-base">🫠</span>
        <span>Certified Slop</span>
        <span className={`ml-1 font-bold ${userVote === "slop" ? "text-yellow-300" : "text-zinc-500"}`}>
          {upvotes}
        </span>
      </button>

      {/* Too Clean (downvote) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote("clean");
        }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
          userVote === "clean"
            ? "bg-zinc-600/30 text-zinc-300 border border-zinc-500/50 scale-105"
            : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span className="text-base">🧹</span>
        <span>Too Clean</span>
        <span className={`ml-1 font-bold ${userVote === "clean" ? "text-zinc-300" : "text-zinc-600"}`}>
          {downvotes}
        </span>
      </button>
    </div>
  );
}
