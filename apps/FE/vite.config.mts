/// <reference types='vitest' />
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
  const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? [];

  const isProductionBuild = command === 'build';

  return {
    // Nx/CI may set NODE_ENV=development during `vite build`; force prod env flags
    // so dev-only dynamic imports (react-scan, react-grab) are tree-shaken.
    mode: isProductionBuild ? 'production' : undefined,
    define: isProductionBuild
      ? {
          'import.meta.env.DEV': 'false',
          'import.meta.env.PROD': 'true',
        }
      : undefined,
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
    plugins: [
      react(),
      tailwindcss(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
    ],
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
