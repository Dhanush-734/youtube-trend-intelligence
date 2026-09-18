"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function AutoRefresh({ intervalSeconds = 60 }: { intervalSeconds?: number }) {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          router.refresh();
          setTimeout(() => setIsRefreshing(false), 800);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds, router]);

  function handleManualRefresh() {
    setIsRefreshing(true);
    setSecondsLeft(intervalSeconds);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  }

  return (
    <button
      type="button"
      onClick={handleManualRefresh}
      className="inline-flex items-center gap-1.5 rounded-xl border border-yt-border bg-yt-elevated px-3 py-1.5 text-xs text-yt-secondary hover:border-yt-secondary/40 hover:text-white transition-all"
      title="Auto-refreshing near-real-time view. Click to reload now."
    >
      <RefreshCw
        className={`h-3 w-3 text-yt-red ${isRefreshing ? "animate-spin" : ""}`}
      />
      <span className="tnum font-medium">Syncs in {secondsLeft}s</span>
    </button>
  );
}
