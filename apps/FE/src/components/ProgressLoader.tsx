import { cn } from '@/lib/utils';

interface ProgressLoaderProps {
  className?: string;
  isVisible?: boolean;
}

const ProgressLoader = ({
  className,
  isVisible = true,
}: ProgressLoaderProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] h-1 bg-academic-blue/20',
        className,
      )}
    >
      <div
        className="h-full bg-academic-blue animate-[progress_2s_ease-in-out_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--academic-blue)), transparent)',
          backgroundSize: '200% 100%',
          animation: 'progress 2s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default ProgressLoader;
