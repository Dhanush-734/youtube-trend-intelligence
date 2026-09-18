"use client";

import { useState } from "react";
import {
  Settings,
  X,
  Database,
  Terminal,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  activeRegion: string;
}

export function SettingsModal({ open, onClose, activeRegion }: SettingsModalProps) {
  const [secret, setSecret] = useState("trendx_mca_secret_key_2026");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  if (!open) return null;

  async function handleTrigger(targetRegion?: string) {
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
          message: `Snapshot recorded for ${targetRegion ?? "all monitored regions"}!`,
        });
        router.refresh();
      } else {
        setResult({
          success: false,
          message: data.error || `Collection failed (HTTP ${res.status})`,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to connect to /api/collect",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-yt-border bg-yt-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-yt-secondary hover:bg-yt-elevated hover:text-white transition-colors"
          aria-label="Close Settings Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yt-red/10 text-yt-red border border-yt-red/30">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Platform Settings & Controls</h2>
            <p className="text-xs text-yt-secondary">System telemetry, snapshot engine & pipeline controls</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Secret token input */}
          <div className="rounded-xl border border-yt-border bg-yt-elevated/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-secret" className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <KeyRound className="h-3.5 w-3.5 text-yt-red" />
                Pipeline Collection Secret
              </label>
              <span className="text-[10px] text-yt-muted font-mono">Bearer Token</span>
            </div>
            <input
              id="auth-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="COLLECT_SECRET"
              className="w-full rounded-lg border border-yt-border bg-yt-bg px-3 py-2 text-xs text-white focus:border-yt-red focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-yt-secondary leading-relaxed">
              Guards <code className="text-yt-red font-mono">/api/collect</code> so YouTube API quota is protected.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTrigger(activeRegion)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-yt-red px-4 py-2.5 text-xs font-bold text-white hover:bg-yt-red-dark disabled:opacity-50 transition-all shadow-[0_0_14px_rgba(255,0,0,0.3)]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Capturing..." : `Sync Active Region (${activeRegion})`}</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTrigger()}
              className="rounded-xl border border-yt-border bg-yt-elevated px-4 py-2.5 text-xs font-semibold text-white hover:border-yt-secondary/40 disabled:opacity-50 transition-all"
            >
              Sync All Regions
            </button>
          </div>

          {/* Result banner */}
          {result && (
            <div
              className={`rounded-xl border p-3 text-xs ${
                result.success
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : "border-yt-red/40 bg-yt-red/10 text-yt-red"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span className="font-semibold">{result.message}</span>
              </div>
            </div>
          )}

          {/* Architecture Information */}
          <div className="rounded-xl border border-yt-border/70 bg-yt-elevated/30 p-3 text-xs text-yt-secondary space-y-2">
            <div className="flex items-center gap-2 font-medium text-white">
              <Database className="h-3.5 w-3.5 text-yt-red" />
              <span>Storage Architecture</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-yt-muted" />
                <span>Append-only snapshots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-yt-muted" />
                <span>Deterministic velocity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
