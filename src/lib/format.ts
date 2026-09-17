export function compact(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(2)}B`;
}

export function full(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString();
}

export function timeAgo(iso: string | Date | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function duration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function clockLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatRankDelta(
  currentRank: number | null | undefined,
  prevRank: number | null | undefined,
): { text: string; type: "up" | "down" | "same" | "new" } {
  if (currentRank === null || currentRank === undefined) {
    return { text: "—", type: "same" };
  }
  if (prevRank === null || prevRank === undefined) {
    return { text: "NEW", type: "new" };
  }
  if (currentRank < prevRank) {
    return { text: `↑${prevRank - currentRank}`, type: "up" };
  }
  if (currentRank > prevRank) {
    return { text: `↓${currentRank - prevRank}`, type: "down" };
  }
  return { text: "•", type: "same" };
}

export function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
