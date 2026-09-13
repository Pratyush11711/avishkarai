"use client";

import { useEffect, useRef } from "react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    const t = window.setTimeout(() => reset(), 200);
    return () => window.clearTimeout(t);
  }, [reset]);

  return (
    <main className="page-wrap flex min-h-[70vh] flex-col justify-center py-24">
      <span className="type-caption text-smoke">Something went wrong</span>
      <h1 className="type-heading mt-3 max-w-[16ch] text-carbon-black">
        This page hit a bad render.
      </h1>
      <p className="mt-4 max-w-[40ch] text-lg text-slate">
        Reloading this view now.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 w-fit rounded-full bg-deep-navy px-5 py-2.5 text-sm text-paper-white"
      >
        Try again
      </button>
    </main>
  );
}
