"use client";

import { useState, useRef, useEffect } from "react";

interface PostMenuProps {
  onDelete: () => void;
}

export function PostMenu({ onDelete }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer text-lg leading-none"
        title="More options"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-2"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
