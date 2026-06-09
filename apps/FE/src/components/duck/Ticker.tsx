interface TickerProps {
  /** Headlines to scroll; duplicated internally for a seamless loop. */
  items: string[];
}

/**
 * Infinite horizontal marquee of fake "case" headlines. Items are rendered
 * twice so the -50% translate loop reads as continuous.
 */
export function Ticker({ items }: TickerProps) {
  const loop = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-t border-border bg-muted py-1.5">
      <div className="flex w-max gap-12 whitespace-nowrap animate-ticker">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2.5 text-base text-muted-foreground/60"
            aria-hidden={i >= items.length ? true : undefined}
          >
            <span className="text-duck-amber/40">&#10022;</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
