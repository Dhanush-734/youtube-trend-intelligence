"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  filename: string;
  data: Record<string, unknown>[];
  label?: string;
}

export function ExportButton({
  filename,
  data,
  label = "Export CSV",
}: ExportButtonProps) {
  function handleExport() {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(","));

    // Data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-xl border border-yt-border bg-yt-elevated px-3 py-1.5 text-xs font-semibold text-white transition-all hover:border-yt-secondary/50 hover:bg-yt-card"
      title="Download snapshot dataset as CSV"
    >
      <Download className="h-3.5 w-3.5 text-yt-red" />
      <span>{label}</span>
    </button>
  );
}
