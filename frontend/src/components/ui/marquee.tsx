"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends Omit<React.ComponentProps<"div">, "children"> {
  items: readonly React.ReactNode[];
  duration?: number;
  defaultPaused?: boolean;
  label?: string;
  pauseLabel?: string;
  resumeLabel?: string;
}

function Marquee({
  items,
  duration = 24,
  defaultPaused = false,
  label = "Scrolling content",
  pauseLabel = "Pause animation",
  resumeLabel = "Resume animation",
  className,
  ...props
}: MarqueeProps) {
  const [paused, setPaused] = React.useState(defaultPaused);
  const itemNodes = items.map((item, index) => (
    <span
      data-slot="marquee-item"
      className="shrink-0 whitespace-nowrap rounded-[var(--neu-radius-small)] border border-[color:var(--border)] bg-[var(--neu-surface)] px-4 py-2 text-sm font-medium"
      key={index}
    >
      {item}
    </span>
  ));

  return (
    <div
      data-slot="marquee"
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 rounded-[var(--neu-radius-surface)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] p-3",
        className,
      )}
      {...props}
    >
      <style>{`
        @keyframes neumorphism-marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-slot="marquee-track"] { animation: none !important; transform: none !important; width: 100%; min-width: 0; }
          [data-slot="marquee-items"] { width: 100%; min-width: 0; flex-wrap: wrap; padding-inline-end: 0; }
          [data-slot="marquee-item"] { max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
          [data-slot="marquee-copy"], [data-slot="marquee-toggle"] { display: none !important; }
        }
      `}</style>
      <div data-slot="marquee-viewport" className="min-w-0 flex-1 overflow-hidden">
        <div
          data-slot="marquee-track"
          className="flex w-max min-w-full items-center will-change-transform"
          style={{
            animation: `neumorphism-marquee-scroll ${duration}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          <div data-slot="marquee-items" className="flex shrink-0 items-center gap-3 pe-3">{itemNodes}</div>
          <div data-slot="marquee-copy" aria-hidden="true" inert className="flex shrink-0 items-center gap-3 pe-3">{itemNodes}</div>
        </div>
      </div>
      <button
        type="button"
        data-slot="marquee-toggle"
        aria-pressed={paused}
        aria-label={paused ? resumeLabel : pauseLabel}
        onClick={() => setPaused(value => !value)}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] text-[var(--foreground)] [box-shadow:var(--neu-shadow-raised-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:[box-shadow:var(--neu-shadow-inset)]"
      >
        <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paused ? "m8 5 11 7-11 7Z" : "M8 5v14M16 5v14"} /></svg>
      </button>
    </div>
  );
}

export { Marquee };
export type { MarqueeProps };
