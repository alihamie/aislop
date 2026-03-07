export default function Loading() {
  return (
    <div className="animate-pulse max-w-2xl mx-auto">
      <div className="h-4 w-20 bg-zinc-800 rounded mb-6" />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-800" />
          <div className="h-3 w-28 bg-zinc-800 rounded" />
        </div>
        <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-5/6 bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-4/6 bg-zinc-800 rounded mb-6" />
        <div className="h-3 w-full bg-zinc-800 rounded mb-1" />
        <div className="h-20 bg-zinc-800/50 rounded-xl mt-4" />
      </div>
    </div>
  );
}
