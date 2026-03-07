// ============================================================
// Types for AI Trash
// ============================================================

export type SlopTier =
  | "BARELY SLOP 😬"
  | "CERTIFIED SLOP 🗑️"
  | "PREMIUM GARBAGE 🗑️🗑️"
  | "WEAPONS-GRADE SLOP 🗑️🗑️🗑️"
  | "LEGENDARY FILTH 🗑️👑";

export type VoteType = "slop" | "clean";
export type ReactionType = "not_slop" | "slop" | "filthy" | "garbage";

export interface ReactionCounts {
  not_slop: number;
  slop: number;
  filthy: number;
  garbage: number;
  total: number;
}

export function getBlendedScore(aiScore: number, counts: ReactionCounts): number {
  if (counts.total < 3) return aiScore; // not enough reactions yet
  // slop = 100%, not_slop = 0%
  const communityAvg = (counts.slop / counts.total) * 100;
  // Community influence scales up to 30% at 10+ reactions
  const communityWeight = Math.min(counts.total / 10, 1) * 0.3;
  return Math.round(aiScore * (1 - communityWeight) + communityAvg * communityWeight);
}

export type FeedSort = "hot" | "fresh" | "most_slopped";

export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title?: string | null;
  content: string;
  slop_score: number;
  verdict: string;
  roast: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  // Joined from profiles
  profiles?: { username: string };
  // Computed (from RPC)
  username?: string;
  hot_score?: number;
  net_votes?: number;
  // Challenge association
  challenge_id?: string | null;
  source_url?: string | null;
  // Reaction counts (from RPC)
  not_slop_count?: number;
  slop_count?: number;
  filthy_count?: number;
  garbage_count?: number;
  total_reactions?: number;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface JudgeResult {
  slop_score: number;
  verdict: string;
  roast: string;
}

export interface Challenge {
  id: string;
  week_start: string; // ISO date string (Monday)
  prompt: string;
  winner_post_id?: string | null;
  created_at: string;
}

export interface ChallengeWithWinner extends Challenge {
  winner_post?: Post | null;
}

export function getSlopTier(score: number): SlopTier {
  if (score <= 20) return "BARELY SLOP 😬";
  if (score <= 40) return "CERTIFIED SLOP 🗑️";
  if (score <= 60) return "PREMIUM GARBAGE 🗑️🗑️";
  if (score <= 80) return "WEAPONS-GRADE SLOP 🗑️🗑️🗑️";
  return "LEGENDARY FILTH 🗑️👑";
}

export function getSlopColor(score: number): string {
  if (score <= 20) return "text-zinc-400";
  if (score <= 40) return "text-green-400";
  if (score <= 60) return "text-yellow-400";
  if (score <= 80) return "text-orange-400";
  return "text-yellow-400";
}

export function getSlopBgColor(score: number): string {
  if (score <= 20) return "bg-zinc-400";
  if (score <= 40) return "bg-green-400";
  if (score <= 60) return "bg-yellow-400";
  if (score <= 80) return "bg-orange-400";
  return "bg-yellow-400";
}

export function getSlopGradient(score: number): string {
  if (score <= 20) return "from-zinc-600 to-zinc-400";
  if (score <= 40) return "from-green-600 to-green-400";
  if (score <= 60) return "from-yellow-600 to-yellow-400";
  if (score <= 80) return "from-orange-600 to-orange-400";
  return "from-yellow-500 to-amber-400";
}

export function timeAgo(date: string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
