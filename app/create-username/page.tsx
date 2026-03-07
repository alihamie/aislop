"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { log } from "@/lib/logger";

// Basic client-side profanity check (full check also on server)
const BLOCKED = ["fuck", "shit", "ass", "bitch", "cunt", "dick", "cock", "pussy", "nigger", "faggot", "retard", "whore", "slut"];
function validateUsername(name: string): string | null {
  if (name.length < 3) return "At least 3 characters";
  if (name.length > 20) return "20 characters max";
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Letters, numbers, and underscores only";
  const lower = name.toLowerCase();
  if (BLOCKED.some((w) => lower.includes(w))) return "That username isn't allowed. Try something else.";
  return null;
}

export default function CreateUsernamePage() {
  const { user, profile, loading, setProfile } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user && profile) router.replace("/profile"); // already has username
  }, [loading, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    const validationError = validateUsername(trimmed);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      setProfile(data.profile);
      log.info("create_username.success", { username: trimmed });
      router.replace("/");
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🗑️</div>
          <h1 className="text-2xl font-black tracking-tighter text-white">Pick your Slop name</h1>
          <p className="text-zinc-500 text-sm mt-2">This is how you'll appear on the feed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="SlopLord2000"
              maxLength={20}
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-400 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-lg font-bold outline-none transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
            <p className="text-zinc-600 text-xs mt-2">3–20 chars · letters, numbers, underscores only</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !username.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black text-lg py-3 rounded-xl transition-colors cursor-pointer"
          >
            {submitting ? "Creating..." : "Claim My Slop Name →"}
          </button>
        </form>
      </div>
    </div>
  );
}
