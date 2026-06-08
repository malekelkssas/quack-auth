import { Eye, EyeOff } from 'lucide-react';

interface PasswordVisibilityToggleProps {
  showPassword: boolean;
  onToggle: () => void;
}

export function PasswordVisibilityToggle({
  showPassword,
  onToggle,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      className="p-1 text-muted-foreground hover:text-duck-amber"
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}
