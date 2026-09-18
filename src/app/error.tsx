"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Database } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught exception:", error);
  }, [error]);

  return (
    <div className="mx-auto my-12 max-w-xl rounded-3xl border border-yt-border bg-yt-card p-8 text-center shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yt-red/15 text-yt-red border border-yt-red/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        Analytics Pipeline Notice
      </h2>

      <p className="mt-2 text-sm text-yt-secondary leading-relaxed">
        {error.message || "An unexpected issue occurred while querying snapshot analytics."}
      </p>

      <div className="mt-6 rounded-2xl border border-yt-border/80 bg-yt-elevated/40 p-4 text-left text-xs text-yt-secondary space-y-2.5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Database className="h-4 w-4 text-yt-red" /> Diagnostics &amp; Telemetry
        </div>
        <ul className="list-disc pl-5 space-y-1 text-yt-secondary">
          <li>Verify PostgreSQL service is active (<code className="text-yt-red font-mono">postgresql-x64-18</code>).</li>
          <li>Check <code className="text-yt-red font-mono">DATABASE_URL</code> in <code className="text-white">.env.local</code>.</li>
          <li>Ensure database schema exists: <code className="text-white">psql -f db/schema.sql</code>.</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-yt-red px-5 py-2.5 text-xs font-bold text-white hover:bg-yt-red-dark transition-all shadow-[0_0_14px_rgba(255,0,0,0.25)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-yt-border bg-yt-elevated px-5 py-2.5 text-xs font-semibold text-white hover:border-yt-secondary/40 transition-all"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
