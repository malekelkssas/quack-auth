import { type ReactNode, useState } from 'react';

import {
  DuckCanvas,
  DUCK_MODE_LABELS,
  type DuckMode,
} from '@/components/duck/DuckCanvas';
import { StarField } from '@/components/duck/StarField';
import { cn } from '@/lib/utils';

const DUCK_MODES: DuckMode[] = ['duckling', 'mallard', 'both'];

interface AuthLayoutProps {
  defaultMode?: DuckMode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  defaultMode = 'duckling',
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const [mode, setMode] = useState<DuckMode>(defaultMode);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-duck-navy px-4 py-8 font-body">
      <StarField />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 border-t-4 border-grass-green bg-[#2d5a1b]">
        <div
          className="absolute inset-x-0 -top-2 h-2"
          style={{
            background:
              'repeating-linear-gradient(90deg,#4a9429 0px,#4a9429 16px,#3a7a1b 16px,#3a7a1b 32px)',
          }}
        />
      </div>

      <div className="relative w-full max-w-[380px]">
        <div className="h-[72px] overflow-hidden rounded-t-xl border-[3px] border-b-0 border-duck-amber bg-sky-blue">
          <DuckCanvas mode={mode} />
        </div>

        <div className="rounded-b-2xl border-[3px] border-duck-amber bg-card px-6 pb-5 pt-6">
          <div className="mb-[18px] flex justify-center gap-2">
            {DUCK_MODES.map((duckMode) => (
              <button
                key={duckMode}
                type="button"
                onClick={() => setMode(duckMode)}
                className={cn(
                  'rounded border-2 border-duck-amber px-2.5 py-1.5 font-pixel text-[8px] uppercase transition-colors',
                  mode === duckMode
                    ? 'bg-duck-amber text-card'
                    : 'bg-transparent text-duck-amber hover:bg-duck-amber hover:text-card',
                )}
              >
                {DUCK_MODE_LABELS[duckMode]}
              </button>
            ))}
          </div>

          <h1 className="mb-1 text-center font-pixel text-[11px] tracking-wide text-duck-amber">
            {title}
          </h1>
          <p className="mb-5 text-center text-lg text-muted-foreground">
            {subtitle}
          </p>

          {children}

          <p className="mt-3 text-center text-base text-muted-foreground/80">
            {footer}
          </p>
        </div>
      </div>
    </div>
  );
}
