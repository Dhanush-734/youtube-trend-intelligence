"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2, AlertCircle, Terminal, X, Zap } from "lucide-react";

export function ManualSyncModal({ region }: { region: string }) {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("trendx_mca_secret_key_2026");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; raw?: unknown } | null>(null);
  const router = useRouter();

  async function handleCollect(targetRegion?: string) {
    setLoading(true);
    setResult(null);

    try {
      const url = targetRegion ? `/api/collect?region=${targetRegion}` : "/api/collect";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: `Successfully captured snapshot for ${targetRegion ?? "all regions"}! Quota used: ${data.quotaUsed ?? 0} units.`,
          raw: data,
        });
        router.refresh();
      } else {
        setResult({
          success: false,
          message: data.error || `Collection failed with HTTP ${res.status}`,
          raw: data,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error triggering collector",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setResult(null);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-yt-red/40 bg-yt-red/10 px-3 py-1.5 text-xs font-semibold text-yt-red hover:bg-yt-red hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,0,0.15)]"
        title="Trigger live snapshot collection for demonstration"
      >
        <Zap className="h-3.5 w-3.5" />
        <span>Sync Engine</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-yt-border bg-yt-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yt-red/10 text-yt-red border border-yt-red/30">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pipeline Control & Snapshot Engine</h3>
                <p className="text-xs text-yt-secondary">Test near-real-time collection telemetry</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-yt-border bg-yt-elevated/40 p-3.5 space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Collector Secret (<code className="text-yt-red font-mono">COLLECT_SECRET</code>)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter COLLECT_SECRET"
                  className="w-full rounded-xl border border-yt-border bg-yt-bg px-3 py-2 text-xs text-white focus:border-yt-red focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-yt-secondary">
                  Protects <code className="text-yt-red">/api/collect</code> so YouTube quota cannot be drained publicly.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCollect(region)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-yt-red px-4 py-2.5 text-xs font-bold text-white hover:bg-yt-red-dark disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(255,0,0,0.25)]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Capturing..." : `Collect Active Region (${region})`}</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCollect()}
                  className="rounded-xl border border-yt-border bg-yt-elevated px-4 py-2.5 text-xs font-semibold text-white hover:border-yt-secondary/40 disabled:opacity-50 transition-all"
                >
                  Collect All 5 Regions
                </button>
              </div>

              {result && (
                <div
                  className={`mt-4 rounded-xl border p-3.5 text-xs ${
                    result.success
                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                      : "border-yt-red/40 bg-yt-red/10 text-yt-red"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{result.message}</div>
                      {result.raw ? (
                        <pre className="mt-2 max-h-36 overflow-auto rounded-lg bg-yt-bg p-2 text-[10px] text-yt-secondary font-mono border border-yt-border">
                          {JSON.stringify(result.raw, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-yt-border/60 bg-yt-elevated/40 p-3.5 text-xs text-yt-secondary">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <Terminal className="h-3.5 w-3.5 text-yt-red" /> Observation Note
                </div>
                Observed growth and views-per-hour are computed from consecutive snapshots.
                Running the collector produces a new timestamped snapshot in PostgreSQL without overwriting historical records.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
