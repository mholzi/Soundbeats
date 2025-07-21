import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/soundbeats-panel.ts',
      formats: ['es'],
      fileName: () => 'soundbeats-panel.js'
    },
    rollupOptions: {
      external: [],  // Bundle everything including Lit
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015'
  }
})