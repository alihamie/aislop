'use client';

import { useState } from 'react';

export default function UpvoteButton({ id, initial }: { id: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    if (voted || loading) return;
    setLoading(true);
    try {
      await fetch('/api/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setCount((c) => c + 1);
      setVoted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={voted || loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all
        ${voted
          ? 'bg-yellow-400/20 text-yellow-400 cursor-default'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
        }`}
    >
      <span>{voted ? '🔥' : '👍'}</span>
      <span>{count}</span>
    </button>
  );
}
