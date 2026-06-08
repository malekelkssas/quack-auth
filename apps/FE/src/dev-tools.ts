/**
 * Dev-only tooling — import this module before React in main.tsx.
 * @see https://github.com/aidenybai/react-scan/blob/main/docs/installation/vite.md
 * @see https://github.com/aidenybai/react-grab/blob/main/README.md#vite
 */
import { scan } from 'react-scan';

if (import.meta.env.DEV) {
  scan({ enabled: true });
  void import('react-grab');
}
