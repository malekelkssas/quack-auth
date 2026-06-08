import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Chunky amber pixel button — Press Start 2P, 3px feel, snappy press.
 * Hover inverts to navy-on-amber; press nudges scale like a game controller.
 */
export function PixelButton({
  className,
  type = 'button',
  ...props
}: PixelButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'w-full rounded-md border-2 border-duck-amber bg-duck-amber px-3 py-3 font-pixel text-[9px] uppercase tracking-wider text-primary-foreground transition-colors',
        'hover:bg-card hover:text-duck-amber active:scale-[0.97]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export default PixelButton;
