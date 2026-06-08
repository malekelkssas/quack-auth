import type { ReactNode } from 'react';

import { DuckCanvas, type DuckMode } from '@/components/duck/DuckCanvas';
import { StarField } from '@/components/duck/StarField';
import { cn } from '@/lib/utils';

const DUCK_MODES: DuckMode[] = ['duckling', 'mallard', 'both'];

interface AuthLayoutProps {
  mode: DuckMode;
  onModeChange: (mode: DuckMode) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared pond scene: starfield + grass ground, duck stage, and a pixel card. */
export function AuthLayout({
  mode,
  onModeChange,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-duck-navy px-4 py-8 font-body">
      <StarField />

      {/* grass ground strip with a pixel top edge */}
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
        {/* duck stage */}
        <div className="h-[72px] overflow-hidden rounded-t-xl border-[3px] border-b-0 border-duck-amber bg-sky-blue">
          <DuckCanvas mode={mode} />
        </div>

        {/* pixel card */}
        <div className="rounded-b-2xl border-[3px] border-duck-amber bg-card px-6 pb-5 pt-6">
          <div className="mb-[18px] flex justify-center gap-2">
            {DUCK_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={cn(
                  'rounded border-2 border-duck-amber px-2.5 py-1.5 font-pixel text-[8px] uppercase transition-colors',
                  mode === m
                    ? 'bg-duck-amber text-card'
                    : 'bg-transparent text-duck-amber hover:bg-duck-amber hover:text-card',
                )}
              >
                {m === 'both'
                  ? 'Both!'
                  : m.charAt(0).toUpperCase() + m.slice(1)}
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

          <p className="mt-3 text-center text-base text-[#555588]">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
