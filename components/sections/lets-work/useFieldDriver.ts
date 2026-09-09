"use client";

import { useEffect, useRef } from "react";

/**
 * Feeds both field implementations the scroll/pointer state they need, without
 * reading layout on any frame.
 *
 * That constraint is the whole point of this hook: a single
 * getBoundingClientRect() during the render loop forces a full layout of this
 * page, which measures around 48ms — an order of magnitude more than drawing
 * the field. Geometry is therefore sampled only on resize and as the panel
 * comes into view, and scroll position is cached from a passive listener.
 */
export interface FieldDriver {
  /** 0 as the panel locks to the viewport, 1 as it releases. */
  progress: number;
  /** Viewport y of the sticky panel's top edge. */
  panelTop: number;
  panelHeight: number;
  /** Raw client coordinates; each field maps them into its own space. */
  pointerX: number;
  pointerY: number;
  pointerActive: boolean;
}

export function useFieldDriver(
  sectionRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>
) {
  const driver = useRef<FieldDriver>({
    progress: 0,
    panelTop: 0,
    panelHeight: 0,
    pointerX: 0,
    pointerY: 0,
    pointerActive: false,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;

    let sectionTop = 0;
    let sectionHeight = 0;
    let panelHeight = 0;
    let scrollY = window.scrollY;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      panelHeight = panel.clientHeight;
      scrollY = window.scrollY;
      update();
    };

    const update = () => {
      const relativeTop = sectionTop - scrollY;
      const travel = Math.max(1, sectionHeight - panelHeight);
      const progress = Math.min(1, Math.max(0, -relativeTop / travel));

      const state = driver.current;
      state.progress = progress;
      state.panelHeight = panelHeight;
      // Where a `position: sticky` panel actually sits: pinned to 0 while the
      // section spans the viewport, tracking the section on the way in and out.
      state.panelTop = Math.max(relativeTop, Math.min(0, relativeTop + travel));
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      update();
    };

    const onPointerMove = (e: PointerEvent) => {
      const state = driver.current;
      state.pointerX = e.clientX;
      state.pointerY = e.clientY;
      state.pointerActive = true;
    };

    const onPointerLeave = () => {
      driver.current.pointerActive = false;
    };

    measure();

    // Sections above can still be settling; re-measure on approach.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) measure();
      },
      { rootMargin: "20% 0px" }
    );
    observer.observe(section);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerleave", onPointerLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [sectionRef, panelRef]);

  return driver;
}
