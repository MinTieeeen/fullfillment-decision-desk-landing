import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/fulfillment-decision-desk/',
  plugins: [react()],
  // Ant Design alone is ~1 MB minified (~330 kB gzip); accepted for this single-page demo.
  build: { chunkSizeWarningLimit: 1600 },
});
