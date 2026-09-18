import Link from "next/link";
import { Film, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto my-12 max-w-lg rounded-3xl border border-dashed border-yt-border bg-yt-card/50 p-12 text-center shadow-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-yt-border bg-yt-elevated text-yt-secondary">
        <Film className="h-7 w-7 text-yt-red" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-white">Video Not Charted Yet</h1>
      <p className="mx-auto mt-2 text-sm leading-relaxed text-yt-secondary">
        This video has no snapshot recordings for the selected country. It may never have entered the trending chart there, or collection has not yet run.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yt-red px-5 py-2.5 text-xs font-bold text-white hover:bg-yt-red-dark transition-all shadow-[0_0_12px_rgba(255,0,0,0.25)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
