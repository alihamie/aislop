'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'linkedin', label: '💼 LinkedIn Hustle' },
  { value: 'cover_letter', label: '📄 Cover Letter' },
  { value: 'text', label: '📝 Generic Text' },
  { value: 'other', label: '🌀 Other Slop' },
];

const LOADING_MSGS = [
  'Judging your slop...',
  'Cringing internally...',
  'Summoning the AI Critic...',
  'Assigning slop buckets...',
  'Writing a passive-aggressive verdict...',
];

export default function SubmitPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('linkedin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    // Rotate loading messages for fun
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 1200);

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit.');
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter mb-2">
          Submit Your <span className="text-yellow-400">Slop</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Paste your finest AI-generated garbage. The Judge awaits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all border ${
                  category === cat.value
                    ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            The Slop
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your AI-generated masterpiece here... 🤡"
            rows={10}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-yellow-400/50 resize-none transition-colors"
          />
          <p className="text-xs text-zinc-600 mt-1">{content.length} characters</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-lg py-4 rounded-xl transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🪣</span> {loadingMsg}
            </span>
          ) : (
            'Judge My Slop 🤖'
          )}
        </button>
      </form>
    </div>
  );
}
