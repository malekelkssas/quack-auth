import BrowserOnly from '@docusaurus/BrowserOnly';
import Mermaid from '@theme/Mermaid';

type MermaidChartProps = {
  chart: string;
};

/** Client-only Mermaid render — avoids SSG ColorModeProvider errors. */
export default function MermaidChart({ chart }: MermaidChartProps) {
  return (
    <BrowserOnly fallback={<pre>{chart}</pre>}>
      {() => <Mermaid value={chart} />}
    </BrowserOnly>
  );
}
