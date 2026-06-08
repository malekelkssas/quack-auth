import { useEffect, useRef } from 'react';

export type DuckMode = 'duckling' | 'mallard' | 'both';

interface SpriteConfig {
  src: string;
  /** Both sheets are 1236x202 → 6 frames of ~206x202. */
  frames: number;
  /**
   * Per-duck size multiplier applied on top of FILL. The actual draw scale is
   * derived from the source frame height at runtime (see drawScale), so swapping
   * in differently-sized assets keeps the duck roughly stage-height.
   */
  sizeFactor: number;
  speed: number;
  fps: number;
  offsetY: number;
}

/**
 * Fraction of the canvas height the duck should roughly fill. Slightly >1 so the
 * duck reads as standing on the stage floor rather than floating tiny above it.
 */
const FILL = 1.05;

/** Sprite sheets live in apps/FE/public/sprites (Vite serves at /sprites/...). */
const SPRITE: Record<Exclude<DuckMode, 'both'>, SpriteConfig> = {
  duckling: {
    src: '/sprites/duckling.png',
    frames: 6,
    sizeFactor: 1.0,
    speed: 1.2,
    fps: 8,
    offsetY: 0,
  },
  mallard: {
    src: '/sprites/mallard.png',
    frames: 6,
    sizeFactor: 1.05,
    speed: 1.0,
    fps: 7,
    offsetY: 0,
  },
};

interface DuckPosition {
  x: number;
  frameIdx: number;
  frameTimer: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

interface DuckCanvasProps {
  mode: DuckMode;
  /** Stage/canvas height in CSS pixels. */
  height?: number;
}

/**
 * Animated walking-duck sprite stage. Ducks loop across the canvas on a pixel
 * grid (stepped, no easing) — typed port of tmp/DuckLogin.jsx DuckCanvas.
 */
export function DuckCanvas({ mode, height = 72 }: DuckCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const keys: Array<Exclude<DuckMode, 'both'>> =
      mode === 'both' ? ['duckling', 'mallard'] : [mode];
    const images: Partial<Record<Exclude<DuckMode, 'both'>, HTMLImageElement>> =
      {};
    const pos: Record<Exclude<DuckMode, 'both'>, DuckPosition> = {
      duckling: { x: -80, frameIdx: 0, frameTimer: 0 },
      mallard: { x: -200, frameIdx: 0, frameTimer: 0 },
    };

    let animId = 0;
    let lastTime = performance.now();
    let alive = true;

    function getFrameW(k: Exclude<DuckMode, 'both'>): number {
      const img = images[k];
      return img ? Math.round(img.width / SPRITE[k].frames) : 0;
    }

    function loop(ts: number) {
      if (!alive || !canvas || !ctx) return;
      const dt = Math.min((ts - lastTime) / 1000, 0.1);
      lastTime = ts;

      canvas.width = canvas.offsetWidth;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      keys.forEach((k) => {
        const sp = SPRITE[k];
        const p = pos[k];
        const img = images[k];
        if (!img) return;

        const fw = getFrameW(k);
        // Derive the draw scale from the source frame height so the duck is
        // roughly the stage height regardless of the asset's native resolution.
        const drawScale = (canvas.height * FILL * sp.sizeFactor) / img.height;
        const dw = Math.round(fw * drawScale);
        const dh = Math.round(img.height * drawScale);
        const dy = canvas.height - dh - sp.offsetY;

        ctx.drawImage(
          img,
          p.frameIdx * fw,
          0,
          fw,
          img.height,
          Math.round(p.x),
          dy,
          dw,
          dh,
        );

        p.x += sp.speed * 60 * dt;
        if (p.x > canvas.width + 20) p.x = -dw - 20;

        p.frameTimer += dt;
        if (p.frameTimer >= 1 / sp.fps) {
          p.frameTimer = 0;
          p.frameIdx = (p.frameIdx + 1) % sp.frames;
        }
      });

      animId = requestAnimationFrame(loop);
    }

    async function setup() {
      await Promise.all(
        keys.map(async (k) => {
          try {
            images[k] = await loadImage(SPRITE[k].src);
          } catch {
            /* sprite failed to load — skip drawing it */
          }
        }),
      );
      if (alive) animId = requestAnimationFrame(loop);
    }

    void setup();

    return () => {
      alive = false;
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      className="pixelated block h-full w-full"
      aria-hidden="true"
    />
  );
}

export default DuckCanvas;
