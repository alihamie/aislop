"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Counts down to the end of the current week (Sunday 23:59:59 UTC).
 * On expiry, refreshes the page so next week's challenge loads.
 */
export function ChallengeCountdown() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(getMsUntilWeekEnd());

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = getMsUntilWeekEnd();
      setTimeLeft(ms);
      if (ms <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const { days, hours, minutes, seconds } = msToComponents(timeLeft);

  return (
    <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
      <span className="text-zinc-500">Challenge ends in</span>
      <span className="font-mono font-bold text-zinc-200 tabular-nums">
        {days > 0 && <span>{days}d </span>}
        <span>{pad(hours)}h </span>
        <span>{pad(minutes)}m </span>
        <span>{pad(seconds)}s</span>
      </span>
    </div>
  );
}

/** Returns milliseconds until Sunday 23:59:59 UTC of the current week */
function getMsUntilWeekEnd(): number {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun...6=Sat
  const daysUntilEndOfSunday = day === 0 ? 0 : 7 - day;
  const endOfSunday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilEndOfSunday,
      23,
      59,
      59,
      999
    )
  );
  return Math.max(0, endOfSunday.getTime() - now.getTime());
}

function msToComponents(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
