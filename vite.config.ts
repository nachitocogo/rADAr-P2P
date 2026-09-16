import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → dist/ normal (para Netlify / GitHub Pages)
// `npm run build:single` → dist/index.html con todo inline (preview compartible / Artifact)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2020' },
}));
