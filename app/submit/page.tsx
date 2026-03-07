"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { createRequestId, log } from "@/lib/logger";
import { SlopMeter } from "../components/SlopMeter";
import { SlopStampButton } from "../components/SlopStampButton";
import { getSlopColor } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";

const IS_LOCALHOST =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const LOADING_MSGS = [
  "Analyzing slop levels... oh no.",
  "Calibrating the Slop-o-Meter...",
  "Counting buzzwords... there are so many.",
  "Measuring filler phrases... we're running out of units.",
  "Detecting AI fingerprints... found seventeen.",
  "The judge is weeping.",
  "Almost done roasting... this is bad.",
  "Contacting hazmat team...",
  "Preparing roast. This may sting.",
];

const MAX_CHARS = 5000;
const MAX_POSTS_PER_DAY = 3;

interface SubmitResult {
  slop_score: number;
  verdict: string;
  roast: string;
  id: string;
  remaining: number;
}

function detectUrlType(url: string): "tweet" | "reddit" | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com")) return "tweet";
    if (u.hostname.includes("reddit.com")) return "reddit";
    return null;
  } catch {
    return null;
  }
}

function SubmitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challenge_id");

  const [challengePrompt, setChallengePrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) return;
    fetch("/api/challenge/today")
      .then((r) => r.json())
      .then((data) => {
        if (data?.challenge?.id === challengeId) setChallengePrompt(data.challenge.prompt);
      })
      .catch(() => {});
  }, [challengeId]);

  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "done" | "error" | "unsupported">("idle");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const fetchedUrl = useRef("");

  const { user, loading: authLoading, authError } = useAuth();
  const supabase = createClient();
  const isAuthenticated = !!user;

  const handleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/submit` },
    });
  };

  // Auto-fetch when URL changes and is recognizable
  const handleUrlChange = async (val: string) => {
    setUrl(val);
    const trimmed = val.trim();
    if (!trimmed || fetchedUrl.current === trimmed) return;

    const type = detectUrlType(trimmed);
    if (!type) {
      // Not a tweet/reddit — just keep URL as source, clear any prior fetched content
      if (fetchStatus === "done") {
        setContent("");
        setFetchStatus("idle");
      }
      return;
    }

    fetchedUrl.current = trimmed;
    setFetchStatus("loading");
    setError("");

    try {
      const endpoint = type === "tweet" ? "/api/extract-tweet" : "/api/extract-reddit";
      const res = await fetch(`${endpoint}?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setFetchStatus("error");
        setError(data.error ?? "Couldn't extract content from that URL.");
      } else {
        setContent(data.text ?? "");
        if (!title.trim()) {
          if (data.author) setTitle(type === "tweet" ? `Tweet by ${data.author}` : `Post by ${data.author}`);
          else if (data.title) setTitle(data.title);
        }
        setFetchStatus("done");
      }
    } catch {
      setFetchStatus("error");
      setError("Failed to fetch content from URL.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    const requestId = createRequestId("submit");
    log.info("submit.client.start", { requestId, contentLength: content.trim().length, isLocalhost: IS_LOCALHOST });

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 1200);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": requestId },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || undefined,
          ...(challengeId ? { challenge_id: challengeId } : {}),
          ...(url.trim() ? { source_url: url.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data as SubmitResult);
      setTimeout(() => router.push(`/post/${data.id}`), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  };

  if (authLoading) {
    return <div className="max-w-2xl mx-auto text-center py-20"><div className="animate-pulse text-4xl">🗑️</div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-black mb-3">Sign In to Dump Slop</h1>
        <p className="text-zinc-400 text-sm mb-6">You need an account to submit AI-generated garbage.</p>
        {authError && <p className="text-xs text-red-400 mb-4">Auth status issue: {authError}</p>}
        <button
          onClick={handleSignIn}
          className="inline-flex items-center gap-2 bg-white text-zinc-900 font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (result) {
    const slopColor = getSlopColor(result.slop_score);
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <div className="text-5xl mb-4">{result.slop_score >= 80 ? "🏆" : result.slop_score >= 60 ? "🗑️" : "😬"}</div>
        <h1 className="text-2xl font-black mb-6">The Verdict Is In!</h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <SlopMeter score={result.slop_score} size="lg" />
          <div className="mt-6 bg-zinc-800/60 border border-yellow-400/20 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1">🤖 Slop Judge</p>
            <p className={`${slopColor} font-semibold italic text-lg`}>&ldquo;{result.roast}&rdquo;</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <SlopStampButton postId={result.id} score={result.slop_score} roast={result.roast} />
        </div>
        <p className="text-zinc-500 text-sm animate-pulse">Redirecting to your post...</p>
        <p className="text-zinc-600 text-xs mt-2">{result.remaining} dump{result.remaining !== 1 ? "s" : ""} left today</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">
          <span className="text-yellow-400">Slop</span> Dump 🗑️
        </h1>
        <p className="text-zinc-400 text-sm">Paste your slop here. Don&apos;t be shy. We&apos;ve seen worse.</p>
        <p className="text-zinc-600 text-xs mt-1">{MAX_POSTS_PER_DAY} dumps per day. Choose disgrace wisely.</p>
      </div>

      {challengeId && (
        <div className="mb-6 flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3">
          <span className="text-xl shrink-0">⚔️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-0.5">Weekly Challenge Entry</p>
            <p className="text-sm font-semibold text-zinc-200">{challengePrompt ?? "This week's challenge"}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL — first, always shown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            URL <span className="text-zinc-600 normal-case font-normal tracking-normal">(optional — tweet, Reddit, or any link)</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://x.com/... or https://reddit.com/... or any URL"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400/50 transition-colors pr-24"
            />
            {fetchStatus === "loading" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 animate-pulse">Fetching…</span>
            )}
            {fetchStatus === "done" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500">✓ Extracted</span>
            )}
          </div>
          {fetchStatus === "error" && error && (
            <p className="text-xs text-orange-400 mt-1">⚠ {error} — paste the text below manually.</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Title <span className="text-zinc-600 normal-case font-normal tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your slop a name..."
            maxLength={100}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>

        {/* Content textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            The Slop {fetchStatus === "done" && <span className="text-green-500 normal-case font-normal tracking-normal text-xs">— auto-filled from URL</span>}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your AI-generated masterpiece here. The sloppier the better. We don't judge. (We absolutely judge.) 🗑️"
            rows={10}
            required
            maxLength={MAX_CHARS}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400/50 resize-none transition-colors"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-zinc-600">Pro tip: leverage synergies for maximum slop points</p>
            <p className={`text-xs ${content.length > MAX_CHARS * 0.9 ? "text-orange-400" : "text-zinc-600"}`}>
              {content.length} / {MAX_CHARS}
            </p>
          </div>
        </div>

        {error && fetchStatus !== "error" && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black text-lg py-4 rounded-xl transition-colors cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block">🗑️</span> {loadingMsg}
            </span>
          ) : (
            "Dump Slop 🗑️"
          )}
        </button>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto text-center py-20"><div className="animate-pulse text-4xl">🗑️</div></div>}>
      <SubmitPageContent />
    </Suspense>
  );
}
