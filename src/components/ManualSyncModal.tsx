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
        className="inline-flex items-center gap-1.5 rounded-lg border border-cool/40 bg-cool/10 px-2.5 py-1.5 text-xs font-semibold text-cool hover:bg-cool/20 hover:border-cool transition-all"
        title="Trigger live snapshot collection for viva demo"
      >
        <RefreshCw className="h-3.5 w-3.5 animate-[spin_4s_linear_infinite]" />
        <span>Sync Engine</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-edge bg-panel p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-muted hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cool/10 text-cool border border-cool/30">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-base font-600 text-text">Pipeline Control & Snapshot Trigger</h3>
                <p className="text-xs text-muted">Test near-real-time collection for MCA demonstration</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted">
                  Collector Secret (<code className="text-cool">COLLECT_SECRET</code>)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your COLLECT_SECRET"
                  className="mt-1.5 w-full rounded-md border border-edge bg-raised px-3 py-2 text-xs text-text focus:border-cool focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Protects <code className="text-cool">/api/collect</code> so YouTube quota cannot be drained publicly.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCollect(region)}
                  className="flex-1 rounded-md bg-cool px-3 py-2 text-xs font-semibold text-ink hover:bg-cool/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Capturing..." : `Collect Active Region (${region})`}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCollect()}
                  className="rounded-md border border-edge bg-raised px-3 py-2 text-xs font-semibold text-text hover:border-cool/50 disabled:opacity-50 transition-all"
                >
                  Collect All 5 Regions
                </button>
              </div>

              {result && (
                <div
                  className={`mt-4 rounded-lg border p-3 text-xs ${
                    result.success
                      ? "border-good/40 bg-good/10 text-good"
                      : "border-heat/40 bg-heat/10 text-heat"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{result.message}</div>
                      {result.raw ? (
                        <pre className="mt-2 max-h-36 overflow-auto rounded bg-ink/80 p-2 text-[10px] text-muted">
                          {JSON.stringify(result.raw, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-edge/60 bg-raised/40 p-3 text-[11px] text-muted">
                <div className="flex items-center gap-1.5 font-medium text-text mb-1">
                  <Terminal className="h-3.5 w-3.5 text-cool" /> Viva Observation Note
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
