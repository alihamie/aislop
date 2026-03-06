import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { AuthButton } from "./components/AuthButton";
import { AuthProvider } from "./components/AuthProvider";
import { SlopDumpButton } from "./components/SlopDumpButton";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Slop — Where AI Slop Gets Celebrated 🗑️",
  description:
    "Paste your AI-generated slop. Get rated by the Slop-o-Meter. Compete for the sloppiest post.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitrash.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <AuthProvider>
          <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-3xl">🗑️</span>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-2xl tracking-tighter">
                    AI<span className="text-yellow-400">Slop</span>
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase hidden sm:block">
                    The Internet&apos;s Premier AI Slop Repository
                  </span>
                </div>
              </Link>
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/challenge"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <span>⚔️</span>
                  <span>Weekly</span>
                </Link>
              </nav>
              <div className="hidden sm:flex items-center gap-3">
                <SlopDumpButton />
                <AuthButton />
              </div>
            </div>
          </header>
          <main className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">{children}</main>
          <footer className="border-t border-zinc-800 mt-16 py-6 text-center text-zinc-600 text-sm hidden sm:block">
            AI Slop — where AI slop goes to be judged and celebrated 🗑️👑
          </footer>

          {/* Mobile bottom nav */}
          <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
            <div className="flex items-center justify-around px-2 py-2">
              <Link href="/" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <span className="text-xl">🗑️</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Feed</span>
              </Link>
              <Link href="/challenge" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <span className="text-xl">⚔️</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Challenge</span>
              </Link>
              <Link href="/submit" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg bg-yellow-400 text-zinc-950 hover:bg-yellow-300 transition-colors">
                <span className="text-xl">＋</span>
                <span className="text-[10px] font-black uppercase tracking-wide">Dump</span>
              </Link>
            </div>
          </nav>
        </AuthProvider>
      </body>
    </html>
  );
}
