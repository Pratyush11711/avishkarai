"use client";

import { HeroCrossField } from "@/components/hero/HeroCrossField";

export default function FlareDevPage() {
  return (
    <main className="min-h-dvh bg-black">
      <div className="h-dvh w-full">
        <HeroCrossField playing />
      </div>
    </main>
  );
}
