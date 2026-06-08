/// <reference types='vitest' />
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? [];

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/FE',
    server: {
      port: 4200,
      host: process.env.VITE_HOST || 'localhost',
      allowedHosts,
    },
    preview: {
      port: 4200,
      host: process.env.VITE_HOST || 'localhost',
      allowedHosts,
    },
    plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    // Uncomment this if you are using workers.
    // worker: {
    //   plugins: () => [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../../dist/apps/FE',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/')
            ) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
