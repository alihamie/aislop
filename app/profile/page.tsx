"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/components/AuthProvider";
import { Post, getSlopColor, getSlopTier, timeAgo, VoteType } from "@/lib/types";
import { SlopMeter } from "@/app/components/SlopMeter";
import { QuickStampButton } from "@/app/components/QuickStampButton";

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSignOut = () => {
    window.location.href = "/api/auth/signout";
  };

  if (authLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse">Loading...</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-4xl">🗑️</div>
      <h1 className="text-xl font-black text-white">Sign in to see your slop</h1>
      <p className="text-zinc-500 text-sm">You need an account to view your profile.</p>
      <a href="/" className="px-4 py-2 bg-yellow-400 text-zinc-950 font-black rounded-lg hover:bg-yellow-300 transition-colors">
        Go to Feed
      </a>
    </div>
  );

  const avgScore = posts.length ? Math.round(posts.reduce((s, p) => s + p.slop_score, 0) / posts.length) : 0;
  const topPost = posts.length ? posts.reduce((a, b) => a.slop_score > b.slop_score ? a : b) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 shrink-0 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-2xl font-black text-yellow-300">
            {(profile?.username?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tighter truncate">@{profile?.username ?? "..."}</h1>
            <p className="text-zinc-500 text-sm">{posts.length} slop dump{posts.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-yellow-400">{posts.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Dumps</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black" style={{ color: getSlopColor(avgScore).replace("text-", "") }}>{avgScore}%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Avg Slop</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-yellow-400">{topPost ? topPost.slop_score : 0}%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Peak Slop</div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Your Slop Dumps</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-zinc-600">
              <div className="text-4xl mb-3">🗑️</div>
              <p className="font-bold">No slop yet</p>
              <p className="text-sm mt-1">
                <a href="/submit" className="text-yellow-400 hover:underline">Dump your first slop →</a>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      {post.title && <p className="font-black text-sm text-white mb-1">{post.title}</p>}
                      <p className="text-zinc-400 text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <QuickStampButton postId={post.id} score={post.slop_score} roast={post.roast} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                        className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <SlopMeter score={post.slop_score} size="sm" />
                  <div className="mt-2">
                    <span className="text-xs text-zinc-500">{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
