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
    console.error("Dashboard error boundary triggered:", error);
  }, [error]);

  return (
    <div className="mx-auto my-12 max-w-xl rounded-2xl border border-edge bg-panel/80 p-8 text-center backdrop-blur-md shadow-2xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-heat/10 text-heat border border-heat/30">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h2 className="mt-4 font-display text-xl font-bold text-text">
        Analytics Query Notice
      </h2>

      <p className="mt-2 text-sm text-muted leading-relaxed">
        {error.message || "An unexpected issue occurred while querying snapshot analytics."}
      </p>

      <div className="mt-6 rounded-xl border border-edge/60 bg-raised/50 p-4 text-left text-xs text-muted space-y-2">
        <div className="flex items-center gap-2 font-medium text-text">
          <Database className="h-4 w-4 text-cool" /> Troubleshooting Diagnostics
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verify local PostgreSQL service is running (<code className="text-cool">postgresql-x64-18</code>).</li>
          <li>Check <code className="text-cool">DATABASE_URL</code> in <code className="text-cool">.env.local</code>.</li>
          <li>Ensure the database schema has been applied with <code className="text-cool">psql -f db/schema.sql</code>.</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-cool px-4 py-2 text-xs font-semibold text-ink hover:bg-cool/90 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-edge bg-raised px-4 py-2 text-xs font-semibold text-text hover:border-cool/40 transition-all"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
