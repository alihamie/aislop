"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase";

export function MobileNav() {
  const pathname = usePathname();

  const navItem = (href: string, emoji: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
          isActive ? "text-yellow-400" : "text-zinc-400 hover:text-white"
        }`}
      >
        <span className="text-xl">{emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
      <div className="flex items-center justify-around px-2 py-2">
        {navItem("/", "🗑️", "Feed")}
        {navItem("/challenge", "⚔️", "Challenge")}
        {navItem("/submit", "＋", "Dump")}
      </div>
    </nav>
  );
}

export function MobileProfileIcon() {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (loading) return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />;

  if (!user) return (
    <button
      onClick={handleSignIn}
      className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
      title="Sign in"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </button>
  );

  return (
    <Link href="/profile">
      <div className="w-8 h-8 rounded-full bg-yellow-400/20 border-2 border-yellow-400/60 flex items-center justify-center text-sm font-black text-yellow-300 cursor-pointer">
        {(profile?.username?.[0] ?? "?").toUpperCase()}
      </div>
    </Link>
  );
}
