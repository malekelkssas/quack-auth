import { cn } from '@/lib/utils';

interface SpeechBubbleProps {
  /** Quote lines, one entry per rendered line. */
  lines: string[];
  signature?: string;
  className?: string;
}

/**
 * Amber-bordered pixel speech bubble with a right-pointing tail — Det.
 * Quacksworth's in-character line beside the detective hero.
 */
export function SpeechBubble({
  lines,
  signature = '— Det. Quacksworth',
  className,
}: SpeechBubbleProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg rounded-br-sm border-2 border-duck-amber bg-card px-3.5 py-2.5',
        'after:absolute after:right-[-10px] after:top-3.5 after:border-[5px]',
        'after:border-transparent after:border-l-duck-amber',
        className,
      )}
    >
      <p className="text-base leading-snug text-duck-amber">
        {lines.map((line, i) => (
          <span key={`${line}-${i}`}>
            {line}
            {i < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
      <p className="mt-1.5 font-pixel text-[6px] text-secondary-foreground">
        {signature}
      </p>
    </div>
  );
}

export default SpeechBubble;
