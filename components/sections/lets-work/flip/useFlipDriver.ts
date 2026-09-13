"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ColliderRect } from "./flip-sim";

export interface FlipPointer {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  isDown: boolean;
  isMobile: boolean;
}

export interface FlipLayout {
  width: number;
  height: number;
}

const DEFAULT_POINTER: FlipPointer = {
  x: -1,
  y: -1,
  prevX: -1,
  prevY: -1,
  isDown: false,
  isMobile: false,
};

export function useFlipDriver(
  sectionRef: React.RefObject<HTMLElement | null>,
  scrollHintRef: React.RefObject<HTMLElement | null>
) {
  const pointerRef = useRef<FlipPointer>({ ...DEFAULT_POINTER });
  const [layout, setLayout] = useState<FlipLayout>({ width: 0, height: 0 });
  const [active, setActive] = useState(false);

  const measure = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    setLayout({ width: r.width, height: r.height });
  }, [sectionRef]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    const mobileMq = window.matchMedia("(max-width: 812px)");
    const syncMobile = () => {
      pointerRef.current.isMobile = mobileMq.matches;
    };
    syncMobile();
    mobileMq.addEventListener("change", syncMobile);

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);

    const toLocal = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const onMove = (clientX: number, clientY: number) => {
      const p = pointerRef.current;
      const local = toLocal(clientX, clientY);
      if (p.x < 0) {
        p.prevX = local.x;
        p.prevY = local.y;
      } else {
        p.prevX = p.x;
        p.prevY = p.y;
      }
      p.x = local.x;
      p.y = local.y;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerRef.current.isDown = true;
      onMove(e.clientX, e.clientY);
    };
    const onPointerUp = () => {
      pointerRef.current.isDown = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        return;
      }
      onMove(e.clientX, e.clientY);
    };

    el.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      mobileMq.removeEventListener("change", syncMobile);
      io.disconnect();
      el.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [measure, sectionRef]);

  const getScrollHintCollider = useCallback((): ColliderRect | null => {
    const section = sectionRef.current;
    const hint = scrollHintRef.current;
    if (!section || !hint) return null;
    const sr = section.getBoundingClientRect();
    const hr = hint.getBoundingClientRect();
    return {
      x: hr.left - sr.left,
      y: hr.top - sr.top,
      w: hr.width,
      h: hr.height,
      l: 0,
      r: 0,
      b: 0,
      t: 0,
      hw: 0,
      hh: 0,
      cx: 0,
      cy: 0,
    };
  }, [sectionRef, scrollHintRef]);

  return {
    pointerRef,
    layout,
    active,
    measure,
    getScrollHintCollider,
  };
}
