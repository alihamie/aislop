export default function Loading() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800" />
            <div className="h-3 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-3/4 bg-zinc-800 rounded mb-4" />
          <div className="h-2 w-full bg-zinc-800 rounded mb-3" />
          <div className="h-12 w-full bg-zinc-800/60 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
