import { useEffect, useRef } from 'react';

/**
 * Static pixel starfield painted once onto a full-bleed canvas — the dusk-pond
 * backdrop. Typed port of tmp/DuckLogin.jsx StarField.
 */
export function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6;
      const s = Math.random() < 0.3 ? 2 : 1;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
      ctx.fillRect(Math.round(x), Math.round(y), s, s);
    }
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default StarField;
