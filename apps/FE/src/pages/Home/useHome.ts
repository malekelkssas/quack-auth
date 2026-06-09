import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { useAuth } from '@/hooks/slices/useAuth';
import { useLazyQuackQuery } from '@/store/api/quackApi';

/** In-character lines for the detective speech bubble; one entry per line. */
const DETECTIVE_QUOTES: string[][] = [
  ["Ah, you're back!", "I've been keeping", 'the pond warm.'],
  ['A new clue', 'arrived at dawn.', 'Shall we?'],
  ['The suspects', 'are getting', 'nervous.'],
  ['Excellent timing,', 'agent. The game', 'is afoot!'],
];

/** Fake case headlines for the scrolling ticker. */
const TICKER_ITEMS: string[] = [
  'CASE #1042 — MISSING BREADCRUMBS',
  'LILY PAD 7 — SUSPICIOUS ACTIVITY',
  'AGENT MALLARD CHECKED IN',
  'NEW FEATHER EVIDENCE LOGGED',
  'POND MAP UPDATED — SECTOR 4',
  'QUACK SIGNAL RECEIVED — NORTH BANK',
];

const OPEN_CASES = 3;
const POND_STATUS = 'ALL CLEAR';

/** Initials from a display name (e.g. "Jane Doe" → "JD"), capped at two. */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AG';
  const initials = parts.map((part) => part[0]).join('');
  return initials.slice(0, 2).toUpperCase();
}

export function useHome() {
  const { user } = useAuth();

  const displayName = user?.name?.trim() || 'Agent';
  const initials = useMemo(() => deriveInitials(displayName), [displayName]);

  const quote = useMemo(
    () => DETECTIVE_QUOTES[Math.floor(Math.random() * DETECTIVE_QUOTES.length)],
    [],
  );

  const [triggerQuack, { data: quackData, isFetching, isError }] =
    useLazyQuackQuery();

  const [quackName, setQuackName] = useState('');

  const onQuackSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = quackName.trim();
      void triggerQuack(trimmed ? { name: trimmed } : undefined);
    },
    [quackName, triggerQuack],
  );

  const quackLines = useMemo<string[]>(() => {
    if (isFetching) return ['Tuning the', 'pond radio...'];
    if (isError) return ['Signal lost.', 'Try again,', 'agent.'];
    if (!quackData?.quack) return quote;
    return ['Incoming signal:', `"${quackData.quack}!"`];
  }, [isFetching, isError, quackData, quote]);

  const tickerItems = useMemo(() => {
    if (!quackData?.quack) return TICKER_ITEMS;
    return [`QUACK SIGNAL — ${quackData.quack.toUpperCase()}`, ...TICKER_ITEMS];
  }, [quackData]);

  const lastSeen = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  return {
    user,
    displayName,
    heroName: displayName.toUpperCase(),
    initials,
    greeting: `Agent ${displayName}`,
    quote: quackLines,
    tickerItems,
    lastSeen,
    pondStatus: isError ? 'SIGNAL LOST' : POND_STATUS,
    openCases: OPEN_CASES,
    quackName,
    setQuackName,
    onQuackSubmit,
    isQuacking: isFetching,
  };
}
