"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Challenge, ChallengeWithWinner, Post, VoteType } from "@/lib/types";
import { getSlopColor, timeAgo } from "@/lib/types";
import { PostCard } from "./PostCard";
import { PostModal } from "./PostModal";
import { SignInModal } from "./SignInModal";
import { ChallengeCountdown } from "./ChallengeCountdown";
import { SlopMeter } from "./SlopMeter";
import { useAuth } from "./AuthProvider";

const PAGE_SIZE = 25;
type Tab = "this-week" | "winners";

interface Props {
  initialChallenge: Challenge;
  initialPosts: Post[];
}

export function WeeklyChallengeClient({ initialChallenge, initialPosts }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const supabase = createClient();

  // ── Tabs ──────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("this-week");

  // ── This-week state ───────────────────────────────────────
  const [posts, setPosts]             = useState<Post[]>(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(initialPosts.length >= PAGE_SIZE);
  const [userVotes, setUserVotes]     = useState<Record<string, VoteType>>({});

  // ── Winners state ──────────────────────────────────────────
  const [winners, setWinners]               = useState<ChallengeWithWinner[] | null>(null);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [winnersHasMore, setWinnersHasMore] = useState(false);
  const [winnersOffset, setWinnersOffset]   = useState(0);

  // ── Modal state ────────────────────────────────────────────
  const [selected, setSelected]             = useState<Post | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  // ── Fetch user votes on mount ──────────────────────────────
  const fetchUserVotes = useCallback(
    async (postIds: string[]) => {
      if (!userId || postIds.length === 0) return;
      const { data } = await supabase
        .from("votes")
        .select("post_id, vote_type")
        .eq("user_id", userId)
        .in("post_id", postIds);
      if (data) {
        setUserVotes((prev) => {
          const updated = { ...prev };
          data.forEach((v: { post_id: string; vote_type: string }) => {
            updated[v.post_id] = v.vote_type as VoteType;
          });
          return updated;
        });
      }
    },
    [userId, supabase]
  );

  useEffect(() => {
    fetchUserVotes(initialPosts.map((p) => p.id));
  }, [initialPosts, fetchUserVotes]);

  // ── Load more challenge posts ──────────────────────────────
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/challenge/today/posts?challenge_id=${initialChallenge.id}&offset=${posts.length}`
      );
      const data = await res.json();
      if (res.ok && data.posts) {
        setPosts((prev) => [...prev, ...data.posts]);
        setHasMore(data.posts.length >= PAGE_SIZE);
        fetchUserVotes(data.posts.map((p: Post) => p.id));
      }
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Handle post delete ─────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  // ── Load winners ───────────────────────────────────────────
  const loadWinners = async (offset = 0) => {
    setWinnersLoading(true);
    try {
      const res = await fetch(`/api/challenge/winners?offset=${offset}`);
      const data = await res.json();
      if (res.ok) {
        if (offset === 0) {
          setWinners(data.challenges ?? []);
        } else {
          setWinners((prev) => [...(prev ?? []), ...(data.challenges ?? [])]);
        }
        setWinnersHasMore(!!data.hasMore);
        setWinnersOffset(offset + (data.challenges?.length ?? 0));
      }
    } finally {
      setWinnersLoading(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === "winners" && winners === null) loadWinners(0);
  };

  const handleEnterChallenge = () => {
    if (!userId) { setShowSignInModal(true); return; }
    router.push(`/submit?challenge_id=${initialChallenge.id}`);
  };

  const weekLabel = formatWeekLabel(initialChallenge.week_start);

  return (
    <>
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border-2 border-yellow-400/60">
        {/* Striped background */}
        <div className="absolute inset-0 bg-yellow-400/10" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(250,204,21,0.05) 10px, rgba(250,204,21,0.05) 20px)"
        }} />
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded-sm">
                  ⚔️ Weekly Slop-Off
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {weekLabel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-1">
                {initialChallenge.prompt}
              </h1>
              <p className="text-sm text-zinc-400 mb-4">
                Submit the sloppiest AI-generated take on this week&apos;s theme. Community votes decide the winner.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ChallengeCountdown />
                <button
                  onClick={handleEnterChallenge}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-sm rounded-xl transition-all hover:scale-105 cursor-pointer shadow-lg shadow-yellow-900/30"
                >
                  🗑️ Dump Your Slop
                </button>
              </div>
            </div>
            <div className="text-6xl hidden sm:block">🏆</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "this-week" as Tab, label: "This Week",    icon: "⚔️" },
          { key: "winners"   as Tab, label: "Past Winners", icon: "🏆" },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors border cursor-pointer ${
              tab === key
                ? "bg-yellow-400 text-zinc-950 border-yellow-400"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── This Week Tab ──────────────────────────────────── */}
      {tab === "this-week" && (
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              <div className="text-5xl mb-4">🏜️</div>
              <p className="font-bold text-lg mb-1">No entries yet</p>
              <p className="text-sm">Be the first to enter this week&apos;s challenge!</p>
              <button
                onClick={handleEnterChallenge}
                className="mt-5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-sm rounded-xl transition-colors cursor-pointer"
              >
                ⚔️ Enter Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={post.id} className="relative pl-6">
                  {/* Rank badge */}
                  <div className="absolute left-0 top-4 z-10">
                    {i === 0 ? (
                      <span className="text-xl leading-none">👑</span>
                    ) : (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-black text-zinc-400">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <PostCard
                    post={post}
                    userVote={userVotes[post.id] ?? null}
                    isAuthenticated={!!userId}
                    onAuthRequired={() => setShowSignInModal(true)}
                    onClick={() => setSelected(post)}
                    currentUserId={userId}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More Entries"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Winners Tab ────────────────────────────────────── */}
      {tab === "winners" && (
        <div>
          {winnersLoading && winners === null ? (
            <div className="text-center py-20 text-zinc-600 animate-pulse">
              <div className="text-4xl">🏆</div>
              <p className="mt-2 text-sm">Loading past winners...</p>
            </div>
          ) : !winners || winners.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              <div className="text-5xl mb-4">📅</div>
              <p className="font-bold text-lg mb-1">No past winners yet</p>
              <p className="text-sm">Check back after this week ends!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((c) => (
                <WinnerCard key={c.id} challenge={c} />
              ))}
            </div>
          )}

          {winnersHasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => loadWinners(winnersOffset)}
                disabled={winnersLoading}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {winnersLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {selected && (
        <PostModal
          post={selected}
          userVote={userVotes[selected.id] ?? null}
          isAuthenticated={!!userId}
          onAuthRequired={() => setShowSignInModal(true)}
          onClose={() => setSelected(null)}
          currentUserId={userId}
          onDelete={handleDelete}
        />
      )}
      {showSignInModal && (
        <SignInModal
          redirectTo={`/submit?challenge_id=${initialChallenge.id}`}
          onClose={() => setShowSignInModal(false)}
        />
      )}
    </>
  );
}

// ── Winner card sub-component ──────────────────────────────

function WinnerCard({ challenge }: { challenge: ChallengeWithWinner }) {
  const post = challenge.winner_post;
  const weekLabel = formatWeekLabel(challenge.week_start);
  const username =
    post?.username ??
    (post?.profiles as { username?: string } | undefined)?.username ??
    "unknown";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Week of {weekLabel}
          </p>
          <p className="font-black text-lg mt-0.5">
            <span className="text-yellow-400">{challenge.prompt}</span>
          </p>
        </div>
        <span className="text-3xl shrink-0">🏆</span>
      </div>

      {post ? (
        <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-black">
              {username[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-bold text-zinc-300">@{username}</span>
            <span className="text-xs text-zinc-600">{timeAgo(post.created_at)}</span>
            <span className="ml-auto text-xs font-bold text-green-400">
              +{post.upvotes - post.downvotes} net votes
            </span>
          </div>
          {post.title && (
            <p className="font-bold text-sm mb-1">{post.title}</p>
          )}
          <p className="text-zinc-400 text-sm line-clamp-3 whitespace-pre-wrap">
            {post.content}
          </p>
          <div className="mt-3">
            <SlopMeter score={post.slop_score} size="sm" />
          </div>
          {post.roast && (
            <div className="mt-2 border-l-2 border-yellow-400/40 pl-3">
              <p className={`text-xs italic ${getSlopColor(post.slop_score)}`}>
                &ldquo;{post.roast}&rdquo;
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-600 text-sm italic">No entries were submitted this week.</p>
      )}
    </div>
  );
}

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
