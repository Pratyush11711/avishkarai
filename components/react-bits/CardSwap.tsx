"use client";

/**
 * Vendored + adapted from React Bits (reactbits.dev/components/card-swap).
 * Adds a controlled `activeIndex` mode so the stack can be driven by an
 * external source (e.g. scroll progress) instead of its own autoplay
 * timer, plus a `reducedMotion` fallback that cross-fades in place instead
 * of running the elastic drop/promote/return choreography.
 */

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { gsap } from "@/lib/gsap";

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  /** Controlled mode: external source (e.g. scroll) drives the front card. Disables autoplay/hover. */
  activeIndex?: number;
  /** Skip the elastic movement choreography and cross-fade cards in place instead. */
  reducedMotion?: boolean;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`absolute top-1/2 left-1/2 rounded-2xl border border-white/15 bg-[radial-gradient(120%_140%_at_50%_-10%,#242424_0%,#161616_55%,#0a0a0a_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,241,0,0.03),0_20px_48px_-14px_rgba(0,0,0,0.9)] [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${
        customClass ?? ""
      } ${rest.className ?? ""}`.trim()}
    />
  )
);
Card.displayName = "Card";

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (
  i: number,
  distX: number,
  distY: number,
  total: number
): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    opacity: 1,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

/** Rotate `order` (treated as circular) so `front` lands at index 0. */
function rotateToFront(order: number[], front: number): number[] {
  const idx = order.indexOf(front);
  if (idx <= 0) return order;
  return [...order.slice(idx), ...order.slice(0, idx)];
}

export const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  activeIndex,
  reducedMotion = false,
  children,
}) => {
  const controlled = activeIndex !== undefined;

  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children]
  );
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef<number[]>(
    Array.from({ length: childArr.length }, (_, i) => i)
  );
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef<number | undefined>(undefined);

  // Uncontrolled autoplay mode — the original React Bits behavior. Unused
  // by the scroll-driven Clock section but kept so this stays a drop-in,
  // reusable primitive elsewhere on the site.
  useEffect(() => {
    if (controlled) return;
    const total = refs.length;
    refs.forEach((r, i) =>
      placeNow(
        r.current!,
        makeSlot(i, cardDistance, verticalDistance, total),
        skewAmount
      )
    );

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current!;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current!;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, "return");
      tl.to(
        elFront,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
        "return"
      );
      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current!;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs.length]);

  // Controlled mode: place the initial stack with `activeIndex` on top,
  // no timers, no hover listeners, no animation for the first paint.
  useEffect(() => {
    if (!controlled || activeIndex === undefined) return;
    const total = refs.length;
    order.current = rotateToFront(
      Array.from({ length: total }, (_, i) => i),
      activeIndex
    );
    refs.forEach((r, i) => {
      if (!r.current) return;
      const orderPos = order.current.indexOf(i);
      const slot = makeSlot(orderPos, cardDistance, verticalDistance, total);
      if (reducedMotion) {
        gsap.set(r.current, {
          x: 0,
          y: 0,
          z: 0,
          xPercent: -50,
          yPercent: -50,
          skewY: 0,
          zIndex: slot.zIndex,
          opacity: orderPos === 0 ? 1 : 0,
          force3D: true,
        });
      } else {
        placeNow(r.current, slot, skewAmount);
      }
    });
    prevActiveRef.current = activeIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled]);

  // Controlled mode: animate to the new front card whenever activeIndex
  // changes. Adjacent moves (the common case — 3 states, one step at a
  // time) reuse the signature elastic drop/promote/return choreography in
  // the right direction; any non-adjacent jump (future N-card growth,
  // fast scrub) falls back to a direct reflow so it never breaks.
  useEffect(() => {
    if (!controlled || activeIndex === undefined) return;
    if (prevActiveRef.current === activeIndex) return;
    const total = refs.length;
    const prevOrder = order.current;
    const newOrder = rotateToFront(prevOrder, activeIndex);

    if (reducedMotion) {
      refs.forEach((r, i) => {
        if (!r.current) return;
        const orderPos = newOrder.indexOf(i);
        gsap.to(r.current, {
          opacity: orderPos === 0 ? 1 : 0,
          duration: 0.35,
          ease: "power1.inOut",
          overwrite: true,
        });
        gsap.set(r.current, { zIndex: total - orderPos });
      });
      order.current = newOrder;
      prevActiveRef.current = activeIndex;
      return;
    }

    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    const isForward = total > 1 && prevOrder[1] === activeIndex;
    const isBackward = total > 1 && prevOrder[total - 1] === activeIndex;

    if (isForward) {
      const front = prevOrder[0];
      const rest = prevOrder.slice(1);
      const elFront = refs[front].current;
      if (elFront) {
        tl.to(elFront, { y: "+=500", duration: config.durDrop, ease: config.ease });
      }
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, total);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.15}`
        );
      });
      if (elFront) {
        const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
        tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
        tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, "return");
        tl.to(
          elFront,
          { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
          "return"
        );
      }
    } else if (isBackward) {
      const back = prevOrder[total - 1];
      const rest = prevOrder.slice(0, -1);
      const elBack = refs[back].current;
      const startSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);

      if (elBack) {
        gsap.set(elBack, { x: startSlot.x, y: startSlot.y - 500, z: startSlot.z, zIndex: total });
        tl.to(elBack, { y: startSlot.y, duration: config.durDrop, ease: config.ease });
      }
      tl.addLabel("demote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i + 1, cardDistance, verticalDistance, total);
        tl.set(el, { zIndex: slot.zIndex }, "demote");
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `demote+=${i * 0.15}`
        );
      });
      if (elBack) {
        const frontSlot = makeSlot(0, cardDistance, verticalDistance, total);
        tl.set(elBack, { zIndex: frontSlot.zIndex }, "demote");
        tl.to(elBack, { x: frontSlot.x, z: frontSlot.z, duration: config.durMove, ease: config.ease }, "demote");
      }
    } else {
      newOrder.forEach((cardIdx, pos) => {
        const el = refs[cardIdx].current;
        if (!el) return;
        const slot = makeSlot(pos, cardDistance, verticalDistance, total);
        tl.set(el, { zIndex: slot.zIndex }, 0);
        tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, 0);
      });
    }

    order.current = newOrder;
    prevActiveRef.current = activeIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, controlled, reducedMotion]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div
      ref={container}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [perspective:900px] overflow-visible"
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
