"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";
import type { Post, FeedSort, ReactionType } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { PostCard } from "./PostCard";
import { SignInModal } from "./SignInModal";

const PAGE_SIZE = 25;

const TABS: { key: FeedSort; label: string; icon: string }[] = [
  { key: "hot", label: "Hot Slop", icon: "🔥" },
  { key: "fresh", label: "Fresh Filth", icon: "🆕" },
  { key: "most_slopped", label: "Hall of Shame", icon: "👑" },
];

interface FeedClientProps {
  initialPosts: Post[];
  initialSort: FeedSort;
}

export default function FeedClient({
  initialPosts,
  initialSort,
}: FeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [sort, setSort] = useState<FeedSort>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedSort") as FeedSort | null;
      if (saved && ["hot", "fresh", "most_slopped"].includes(saved)) return saved;
    }
    return initialSort;
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, { not_slop: number; slop: number; filthy: number; garbage: number; total: number }>>({});
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const router = useRouter();

  const supabase = createClient();

  // Fetch fresh reaction counts + user reactions on mount (batch, always fresh from DB)
  useEffect(() => {
    let active = true;
    const fetchReactions = async () => {
      const postIds = posts.map((p) => p.id);
      if (!postIds.length) return;
      const res = await fetch(`/api/reactions/batch?ids=${postIds.join(",")}`);
      if (!active || !res.ok) return;
      const json = await res.json();
      const counts: Record<string, { not_slop: number; slop: number; filthy: number; garbage: number; total: number }> = {};
      const reactions: Record<string, ReactionType> = {};
      for (const [id, entry] of Object.entries(json.data as Record<string, { counts: { not_slop: number; slop: number; filthy: number; garbage: number; total: number }; userReaction: ReactionType | null }>)) {
        counts[id] = entry.counts;
        if (entry.userReaction) reactions[id] = entry.userReaction;
      }
      setReactionCounts(counts);
      setUserReactions(reactions);
    };
    void fetchReactions();
    return () => { active = false; };
  }, [posts.map(p => p.id).join(","), userId]);

  const fetchPosts = useCallback(
    async (feedSort: FeedSort, offset: number = 0) => {
      const res = await fetch(`/api/posts?sort=${feedSort}&offset=${offset}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.posts as Post[]) ?? [];
    },
    []
  );

  const handleTabChange = async (newSort: FeedSort) => {
    if (newSort === sort) return;
    setSort(newSort);
    localStorage.setItem("feedSort", newSort);
    setLoading(true);
    const data = await fetchPosts(newSort);
    setPosts(data);
    setHasMore(data.length >= PAGE_SIZE);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoading(true);
    const data = await fetchPosts(sort, posts.length);
    setPosts((prev) => [...prev, ...data]);
    setHasMore(data.length >= PAGE_SIZE);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleAuthRequired = () => {
    log.info("feed.vote_requires_auth", {
      path: window.location.pathname,
    });
    setShowSignInModal(true);
  };

  return (
    <div>
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}
      {/* Sort tabs */}
      <div className="flex gap-1.5 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer border ${
              sort === tab.key
                ? "bg-yellow-400 text-zinc-950 border-yellow-400 shadow-lg shadow-yellow-900/30 scale-[1.03]"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-2/3 mb-4" />
              <div className="h-2 bg-zinc-800 rounded w-full mb-3" />
              <div className="h-8 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🗑️</div>
          <h3 className="text-xl font-black text-zinc-300 mb-2 uppercase tracking-wide">
            The Dumpster Is Suspiciously Clean
          </h3>
          <p className="text-zinc-500">
            No slop detected. This is deeply concerning.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                not_slop_count: reactionCounts[post.id]?.not_slop ?? post.not_slop_count ?? 0,
                slop_count: reactionCounts[post.id]?.slop ?? post.slop_count ?? 0,
                filthy_count: reactionCounts[post.id]?.filthy ?? post.filthy_count ?? 0,
                garbage_count: reactionCounts[post.id]?.garbage ?? post.garbage_count ?? 0,
                total_reactions: reactionCounts[post.id]?.total ?? post.total_reactions ?? 0,
              }}
              userReaction={userReactions[post.id] ?? null}
              isAuthenticated={!!userId}
              onAuthRequired={handleAuthRequired}
              onClick={() => router.push(`/post/${post.id}`)}
              currentUserId={userId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && posts.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer border border-zinc-700"
          >
            {loading ? "Sifting through garbage..." : "Load More Slop 🗑️"}
          </button>
        </div>
      )}

      {/* Modal */}
    </div>
  );
}
