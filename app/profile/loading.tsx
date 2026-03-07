export default function Loading() {
  return (
    <div className="animate-pulse max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-zinc-800" />
        <div>
          <div className="h-6 w-32 bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-20 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl" />)}
      </div>
    </div>
  );
}
