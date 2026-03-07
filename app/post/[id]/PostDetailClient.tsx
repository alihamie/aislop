"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { log } from "@/lib/logger";
import type { Post, ReactionType, ReactionCounts } from "@/lib/types";
import { useAuth } from "@/app/components/AuthProvider";
import { ReactionButtons } from "@/app/components/ReactionButtons";
import { ShareButton } from "@/app/components/ShareButton";
import { SlopStampButton } from "@/app/components/SlopStampButton";
import { SignInModal } from "@/app/components/SignInModal";

export function PostDetailClient({ post }: { post: Post }) {
  const [counts, setCounts] = useState<ReactionCounts>({
    not_slop: post.not_slop_count ?? 0,
    slop: post.slop_count ?? 0,
    filthy: post.filthy_count ?? 0,
    garbage: post.garbage_count ?? 0,
    total: post.total_reactions ?? 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const init = async () => {
      const res = await fetch(`/api/reactions/${post.id}`);
      if (!active || !res.ok) return;
      const data = await res.json();
      setCounts(data.counts);
      setUserReaction(data.userReaction ?? null);
    };
    void init();
    return () => { active = false; };
  }, [post.id, userId]);

  const handleAuthRequired = () => {
    log.info("post_detail.reaction_requires_auth", { postId: post.id });
    setShowSignInModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) router.push("/");
  };

  return (
    <>
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} redirectTo={`/post/${post.id}`} />
      )}
      <div className="space-y-3">
        <ReactionButtons
          postId={post.id}
          counts={counts}
          userReaction={userReaction}
          isAuthenticated={!!userId}
          onAuthRequired={handleAuthRequired}
        />
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {userId === post.user_id && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-all border border-red-800/50 cursor-pointer"
            >
              🗑️ Delete
            </button>
          )}
          <SlopStampButton postId={post.id} score={post.slop_score} roast={post.roast} />
          <ShareButton id={post.id} />
        </div>
      </div>
    </>
  );
}
