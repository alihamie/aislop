"use client";

import { Post, getSlopColor, timeAgo, ReactionType, ReactionCounts, getBlendedScore } from "@/lib/types";
import { QuickStampButton } from "./QuickStampButton";
import { SlopMeter } from "./SlopMeter";
import { ReactionButtons } from "./ReactionButtons";
import { PostMenu } from "./PostMenu";

interface PostCardProps {
  post: Post;
  userReaction: ReactionType | null;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onClick: () => void;
  currentUserId?: string | null;
  onDelete?: (id: string) => void;
}

export function PostCard({
  post,
  userReaction,
  isAuthenticated,
  onAuthRequired,
  onClick,
  currentUserId,
  onDelete,
}: PostCardProps) {
  const username = post.username || post.profiles?.username || "Anonymous";
  const reactionCounts: ReactionCounts = {
    not_slop: post.not_slop_count ?? 0,
    slop: post.slop_count ?? 0,
    filthy: post.filthy_count ?? 0,
    garbage: post.garbage_count ?? 0,
    total: post.total_reactions ?? 0,
  };
  const displayScore = getBlendedScore(post.slop_score, reactionCounts);
  const hasCommunityBoost = displayScore !== post.slop_score;
  const slopColor = getSlopColor(displayScore);
  const tilt = post.slop_score % 3 === 0 ? "-rotate-[0.5deg]" : post.slop_score % 3 === 1 ? "rotate-[0.5deg]" : "rotate-[0deg]";
  const isLegendary = displayScore > 80;

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer group ${tilt} hover:rotate-0 ${isLegendary ? "border-yellow-400/60 shadow-yellow-900/20 shadow-lg" : "border-zinc-800"}`}
    >
      {/* Header: username + time + badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-300">
            {username[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-zinc-300">{username}</span>
        </div>
        <div className="flex items-center gap-2">
          {post.challenge_id && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-800 text-yellow-400 border border-yellow-400/40 px-1.5 py-0.5 rounded-sm">
              🏆
            </span>
          )}
          {isLegendary && (
            <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded-sm rotate-[1deg]">
              LEGENDARY
            </span>
          )}
          <span className="text-xs text-zinc-500">{timeAgo(post.created_at)}</span>
          <QuickStampButton postId={post.id} score={post.slop_score} roast={post.roast} />
          {currentUserId === post.user_id && onDelete && (
            <PostMenu onDelete={() => { if (window.confirm("Delete this post?")) onDelete(post.id); }} />
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <h2 className="font-black text-base text-white mb-2">{post.title}</h2>
      )}

      {/* Content preview */}
      <p className="text-zinc-200 text-sm leading-relaxed mb-4 line-clamp-2">
        {post.content}
      </p>

      {/* Slop meter */}
      <div className="mb-3">
        <SlopMeter score={displayScore} size="sm" />
        {hasCommunityBoost && (
          <p className="text-[10px] text-zinc-500 mt-1">
            AI: {post.slop_score}% · Community adjusted: {displayScore}%
          </p>
        )}
      </div>

      {/* AI Roast — prominent verdict */}
      <div className="mb-4 rounded-lg bg-black/40 border border-zinc-700 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base">🤖</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Slop Judge</span>
        </div>
        <p className={`text-sm font-semibold leading-snug ${slopColor}`}>
          &ldquo;{post.roast}&rdquo;
        </p>
      </div>

      {/* Reactions */}
      <ReactionButtons
        postId={post.id}
        counts={reactionCounts}
        userReaction={userReaction}
        isAuthenticated={isAuthenticated}
        onAuthRequired={onAuthRequired}
      />

      {/* Source link */}
      {post.source_url && (
        <div className="mt-2">
          <a
            href={post.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            🔗 source
          </a>
        </div>
      )}
    </div>
  );
}
