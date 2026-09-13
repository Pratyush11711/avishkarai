"use client";

import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";

export type VerticalAccordionItem = {
  id: string | number;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  number?: string;
  accent?: string;
};

function useWindowWidth() {
  const [width, setWidth] = useState(1280);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

const panelVariants = {
  open: { width: "100%", height: "100%" },
  closed: { width: "0%", height: "100%" },
};

const panelVariantsSm = {
  open: { width: "100%", height: "auto" },
  closed: { width: "100%", height: "0px" },
};

const descriptionVariants = {
  open: {
    opacity: 1,
    y: "0%",
    transition: { delay: 0.125 },
  },
  closed: { opacity: 0, y: "100%" },
};

function Panel({
  item,
  open,
  setOpen,
  isDesktop,
}: {
  item: VerticalAccordionItem;
  open: string | number;
  setOpen: (id: string | number) => void;
  isDesktop: boolean;
}) {
  const isOpen = open === item.id;
  const accent = item.accent ?? "var(--color-primary)";

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`principle-panel-${item.id}`}
        onClick={() => setOpen(item.id)}
        className={clsx(
          "relative group z-[1] flex flex-row-reverse lg:flex-col justify-end items-center gap-4",
          "bg-paper-white hover:bg-warm-canvas transition-colors duration-200",
          "p-3 border-r border-b border-ash last:border-r-0 lg:last:border-r lg:border-b-0"
        )}
      >
        <span
          style={{ writingMode: "vertical-lr" }}
          className="hidden lg:block rotate-180 whitespace-nowrap text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-slate"
        >
          {item.title}
        </span>
        <span className="block lg:hidden text-left text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-slate">
          {item.title}
        </span>
        <span
          className="w-6 lg:w-full aspect-square grid place-items-center text-text-inverse"
          style={{ background: accent }}
        >
          <item.Icon className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
        </span>
        <span
          aria-hidden
          className="w-4 h-4 bg-paper-white group-hover:bg-warm-canvas transition-colors border-r border-b lg:border-b-0 lg:border-t border-ash rotate-45 absolute bottom-0 lg:bottom-1/2 right-1/2 lg:right-0 translate-y-1/2 translate-x-1/2 z-20"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`principle-panel-${item.id}`}
            key={`panel-${item.id}`}
            role="region"
            aria-label={item.title}
            variants={isDesktop ? panelVariants : panelVariantsSm}
            initial="closed"
            animate="open"
            exit="closed"
            className="relative w-full h-full overflow-hidden flex items-start bg-deep-navy"
          >
            <motion.div
              variants={descriptionVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="relative z-[1] w-full px-8 py-10 md:px-12 md:py-12 text-text-inverse"
            >
              <h3
                className="font-medium tracking-[-0.02em] text-text-inverse max-w-[16ch]"
                style={{
                  fontSize: "clamp(32px, 4vw, 40px)",
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </h3>
              <p
                className="mt-6 max-w-[46ch] text-text-inverse/85"
                style={{
                  fontSize: "17px",
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {item.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function VerticalAccordion({
  items,
  defaultOpenId,
  onOpenChange,
  className,
}: {
  items: VerticalAccordionItem[];
  defaultOpenId?: string | number;
  onOpenChange?: (index: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState<string | number>(
    defaultOpenId ?? items[0]?.id
  );
  const width = useWindowWidth();
  const isDesktop = width >= 1024;

  const handleOpen = (id: string | number) => {
    setOpen(id);
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) onOpenChange?.(index);
  };

  return (
    <div
      className={clsx(
        "rounded-[24px] bg-primary p-3 md:p-4",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row h-fit lg:h-[520px] w-full overflow-hidden rounded-[16px] shadow-lg">
        {items.map((item) => (
          <Panel
            key={item.id}
            item={item}
            open={open}
            setOpen={handleOpen}
            isDesktop={isDesktop}
          />
        ))}
      </div>
    </div>
  );
}
