import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PixelFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Leading glyph/icon (e.g. ✉ or 🔒). */
  icon?: ReactNode;
  /** Inline validation message (RHF field error). */
  error?: string;
  /** Trailing adornment (e.g. show/hide-password button). */
  trailing?: ReactNode;
}

/**
 * Retro pond form field: amber label + leading icon + chunky pixel input.
 * Forwards its ref so react-hook-form's `register` works directly.
 */
export const PixelField = forwardRef<HTMLInputElement, PixelFieldProps>(
  ({ label, icon, error, trailing, className, id, ...props }, ref) => {
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className="mb-4">
        <label
          htmlFor={id}
          className="mb-1 block font-body text-lg text-duck-amber"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm leading-none text-muted-foreground"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              'w-full rounded-md border-2 border-border bg-input py-2.5 pl-9 pr-3 font-body text-xl text-foreground outline-none transition-colors',
              'placeholder:text-[#444488] focus:border-duck-amber focus:ring-2 focus:ring-duck-amber/20',
              trailing && 'pr-10',
              error && 'border-error',
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {trailing}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 font-body text-base text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PixelField.displayName = 'PixelField';

export default PixelField;
