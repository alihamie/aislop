"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItem = (href: string, emoji: string, label: string, primary = false) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
          primary
            ? isActive
              ? "bg-yellow-300 text-zinc-950"
              : "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
            : isActive
            ? "text-yellow-400"
            : "text-zinc-400 hover:text-white"
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
        {navItem("/submit", "＋", "Dump", true)}
        {navItem("/profile", "👤", "Me")}
      </div>
    </nav>
  );
}
