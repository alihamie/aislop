import { supabase, Post } from '@/lib/supabase';
import UpvoteButton from './components/UpvoteButton';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  text: '📝 Generic Text',
  linkedin: '💼 LinkedIn Hustle',
  cover_letter: '📄 Cover Letter',
  other: '🌀 Other Slop',
};

function SlopBuckets({ rating }: { rating: number }) {
  return (
    <span className="text-lg" title={`${rating}/5 slop buckets`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20'}>🪣</span>
      ))}
    </span>
  );
}

export const revalidate = 0;

export default async function FeedPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-4xl mb-4">💀</p>
        <p>Failed to load slop. Even our database is embarrassed.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter mb-2">
          The Slop <span className="text-yellow-400">Feed</span>
        </h1>
        <p className="text-zinc-400 text-sm">AI-generated garbage, rated by an even snarkier AI.</p>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-5xl mb-4">🫙</p>
          <p className="text-lg font-semibold">No slop yet.</p>
          <p className="text-sm mt-2">Be the first to embarrass yourself.</p>
          <Link
            href="/submit"
            className="inline-block mt-6 bg-yellow-400 text-zinc-950 font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors"
          >
            Submit the first slop →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(posts as Post[]).map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </span>
                <SlopBuckets rating={post.ai_rating} />
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-3 line-clamp-4">
                {post.content}
              </p>

              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between gap-3">
                <p className="text-yellow-400 text-xs font-semibold italic flex-1">
                  🤖 &ldquo;{post.ai_verdict}&rdquo;
                </p>
                <UpvoteButton id={post.id} initial={post.human_upvotes} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
