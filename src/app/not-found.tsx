import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-dashed border-edge bg-panel/50 p-12 text-center">
      <h1 className="font-display text-lg font-600">Not tracked yet</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        This video has no stored snapshots for the selected country. It may never
        have reached the chart there, or the collector has not run since it did.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-md border border-edge bg-panel px-4 py-2 text-sm hover:bg-raised"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
