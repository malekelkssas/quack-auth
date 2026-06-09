import BrowserOnly from '@docusaurus/BrowserOnly';
import { useCallback, useEffect, useRef, useState } from 'react';

type MermaidChartProps = {
  chart: string;
};

const MERMAID_THEMES = { light: 'default', dark: 'dark' } as const;

function readColorMode(): keyof typeof MERMAID_THEMES {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

function MermaidRenderer({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const renderChart = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const colorMode = readColorMode();
    const id = `mermaid-svg-${Math.round(Math.random() * 10_000_000)}`;

    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: MERMAID_THEMES[colorMode],
      });
      const { svg, bindFunctions } = await mermaid.render(id, chart);
      container.innerHTML = svg;
      bindFunctions?.(container);
      setError(null);
    } catch (e) {
      document.querySelector(`#d${id}`)?.remove();
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [chart]);

  useEffect(() => {
    void renderChart();

    const observer = new MutationObserver(() => {
      void renderChart();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [renderChart]);

  if (error) {
    return <pre>{error}</pre>;
  }

  return <div ref={containerRef} className="docusaurus-mermaid-container" />;
}

/** Client-only Mermaid — reads `data-theme` from DOM instead of `useColorMode`. */
export default function MermaidChart({ chart }: MermaidChartProps) {
  return (
    <BrowserOnly fallback={<pre>{chart}</pre>}>
      {() => <MermaidRenderer chart={chart} />}
    </BrowserOnly>
  );
}
