import { useEffect, useRef, useState } from 'react';

export type DuckMode = 'duckling' | 'mallard' | 'both';

type DuckKey = Exclude<DuckMode, 'both'>;

export const DUCK_MODE_LABELS: Record<DuckMode, string> = {
  duckling: 'Duckling',
  mallard: 'Mallard',
  both: 'Both!',
};

interface SpriteConfig {
  src: string;
  frames: number;
  sizeFactor: number;
  speed: number;
  fps: number;
  offsetY: number;
}

const FILL = 1.05;

const SPRITE: Record<DuckKey, SpriteConfig> = {
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

interface DuckMetrics {
  fw: number;
  dw: number;
  dh: number;
  dy: number;
}

const spriteCache = new Map<string, HTMLImageElement>();

function loadSprite(src: string): Promise<HTMLImageElement> {
  const cached = spriteCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    img.src = src;
  });
}

function computeMetrics(
  img: HTMLImageElement,
  sp: SpriteConfig,
  canvasHeight: number,
): DuckMetrics {
  const fw = Math.round(img.width / sp.frames);
  const drawScale = (canvasHeight * FILL * sp.sizeFactor) / img.height;
  const dw = Math.round(fw * drawScale);
  const dh = Math.round(img.height * drawScale);
  const dy = canvasHeight - dh - sp.offsetY;
  return { fw, dw, dh, dy };
}

interface DuckCanvasProps {
  mode: DuckMode;
  height?: number;
}

export function DuckCanvas({ mode, height = 72 }: DuckCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    setReady(false);

    const keys: DuckKey[] = mode === 'both' ? ['duckling', 'mallard'] : [mode];
    const images: Partial<Record<DuckKey, HTMLImageElement>> = {};
    const metrics: Partial<Record<DuckKey, DuckMetrics>> = {};
    const pos: Record<DuckKey, DuckPosition> = {
      duckling: { x: -80, frameIdx: 0, frameTimer: 0 },
      mallard: { x: -200, frameIdx: 0, frameTimer: 0 },
    };
    let positioned = false;

    let animId = 0;
    let lastTime = performance.now();
    let alive = true;
    let tabVisible = !document.hidden;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Spread ducks across the canvas on first paint so they are visible
    // immediately instead of slowly walking in from off-screen.
    const placeDucks = () => {
      if (positioned || canvasWidth === 0) return;
      let allReady = true;
      keys.forEach((key, index) => {
        const m = metrics[key];
        if (!m) {
          allReady = false;
          return;
        }
        pos[key].x =
          keys.length > 1
            ? canvasWidth * (0.12 + index * 0.42)
            : canvasWidth * 0.28;
      });
      if (allReady) positioned = true;
    };

    const syncCanvasSize = () => {
      const nextWidth = canvas.offsetWidth;
      const nextHeight = canvas.offsetHeight || height;
      if (nextWidth === canvasWidth && nextHeight === canvasHeight) return;

      canvasWidth = nextWidth;
      canvasHeight = nextHeight;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      ctx.imageSmoothingEnabled = false;

      for (const key of keys) {
        const img = images[key];
        if (img) metrics[key] = computeMetrics(img, SPRITE[key], canvasHeight);
      }

      placeDucks();
    };

    const resizeObserver = new ResizeObserver(() => syncCanvasSize());
    resizeObserver.observe(canvas);
    syncCanvasSize();

    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (tabVisible) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    function loop(ts: number) {
      if (!alive || !canvas || !ctx) return;

      if (!tabVisible) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = Math.min((ts - lastTime) / 1000, 0.1);
      lastTime = ts;

      syncCanvasSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      keys.forEach((key) => {
        const sp = SPRITE[key];
        const p = pos[key];
        const img = images[key];
        const m = metrics[key];
        if (!img || !m) return;

        ctx.drawImage(
          img,
          p.frameIdx * m.fw,
          0,
          m.fw,
          img.height,
          Math.round(p.x),
          m.dy,
          m.dw,
          m.dh,
        );

        p.x += sp.speed * 60 * dt;
        if (p.x > canvas.width + 20) p.x = -m.dw;

        p.frameTimer += dt;
        if (p.frameTimer >= 1 / sp.fps) {
          p.frameTimer = 0;
          p.frameIdx = (p.frameIdx + 1) % sp.frames;
        }
      });

      animId = requestAnimationFrame(loop);
    }

    async function setup() {
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          images[key] = await loadSprite(SPRITE[key].src);
        }),
      );

      if (import.meta.env.DEV) {
        for (const result of results) {
          if (result.status === 'rejected') {
            console.warn('[DuckCanvas]', result.reason);
          }
        }
      }

      // Recompute metrics for the now-loaded sprites even if the canvas size
      // did not change since the first (pre-load) sync, then position ducks.
      for (const key of keys) {
        const img = images[key];
        if (img && canvasHeight) {
          metrics[key] = computeMetrics(img, SPRITE[key], canvasHeight);
        }
      }
      syncCanvasSize();
      placeDucks();

      if (alive) {
        setReady(true);
        animId = requestAnimationFrame(loop);
      }
    }

    void setup();

    return () => {
      alive = false;
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode, height]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      className="pixelated block h-full w-full transition-opacity duration-500 ease-in-out"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
