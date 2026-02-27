import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AISlop — Submit Your Garbage, Get Judged',
  description: 'A place for AI-generated garbage to be rated by an even snarkier AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
        <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🗑️</span>
              <span className="font-black text-xl tracking-tight">
                AI<span className="text-yellow-400">Slop</span>
              </span>
            </Link>
            <Link
              href="/submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold px-4 py-2 rounded-full text-sm transition-colors"
            >
              Submit Slop →
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-800 mt-16 py-6 text-center text-zinc-600 text-sm">
          AISlop — where AI goes to be judged by AI 🤖
        </footer>
      </body>
    </html>
  );
}
