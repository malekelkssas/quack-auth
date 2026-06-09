interface TickerProps {
  /** Headlines to scroll; duplicated internally for a seamless loop. */
  items: string[];
}

function TickerTrack({
  items,
  trackId,
  ariaHidden,
}: {
  items: string[];
  trackId: string;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-12 pr-12"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((item, i) => (
        <span
          key={`${trackId}-${item}-${i}`}
          className="flex items-center gap-2.5 text-base text-muted-foreground/60"
        >
          <span className="text-duck-amber/40">&#10022;</span>
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Infinite horizontal marquee of case headlines. Two identical tracks scroll
 * together; -50% translate lands on a pixel-identical frame so the loop has
 * no visible reset glitch.
 */
export function Ticker({ items }: TickerProps) {
  return (
    <div className="relative w-full overflow-hidden border-t border-border bg-muted py-1.5">
      <div className="flex w-max animate-ticker will-change-transform">
        <TickerTrack items={items} trackId="a" />
        <TickerTrack items={items} trackId="b" ariaHidden />
      </div>
    </div>
  );
}

export default Ticker;
