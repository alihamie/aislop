export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-xl mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="h-3 w-32 bg-zinc-800 rounded mb-3" />
            <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-2/3 bg-zinc-800 rounded mb-4" />
            <div className="h-2 w-full bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
