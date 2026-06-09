interface StatusBarProps {
  pondStatus: string;
  lastSeen: string;
  openCases: number;
}

/** Footer strip: live pond status, last-seen time, and open case count. */
export function StatusBar({ pondStatus, lastSeen, openCases }: StatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-2 border-border bg-card px-6 py-2.5 text-base text-muted-foreground">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 bg-success animate-blink"
          aria-hidden="true"
        />
        <span>
          Pond status: <span className="text-success">{pondStatus}</span>
        </span>
      </div>
      <span>
        Last seen: <span className="text-duck-amber/70">{lastSeen}</span>
      </span>
      <span>
        Open cases: <span className="text-duck-amber/70">{openCases}</span>
      </span>
    </div>
  );
}

export default StatusBar;
