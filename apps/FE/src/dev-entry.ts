/**
 * Bootstrap: load dev tools before the app (dev only), then start React.
 * @see https://github.com/aidenybai/react-scan/blob/main/docs/installation/vite.md
 */
void (async () => {
  if (!import.meta.env.PROD) {
    await import('./dev-tools');
  }

  await import('./main');
})();
