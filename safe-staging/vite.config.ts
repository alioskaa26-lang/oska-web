import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const appDeployBuild = Boolean(process.env.APPDEPLOY_VITE_OUT_DIR);

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: appDeployBuild
      ? {}
      : {
          '@appdeploy/client': fileURLToPath(
            new URL('./src/appdeployClientStatic.ts', import.meta.url)
          ),
        },
  },
  build: {
    outDir: process.env.APPDEPLOY_VITE_OUT_DIR || 'dist',
    sourcemap:
      process.env.APPDEPLOY_VITE_SOURCEMAP === 'hidden' ? 'hidden' : false,
    rollupOptions: {
      maxParallelFileOps: 128,
    },
  },
});
