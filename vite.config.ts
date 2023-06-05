import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [eslint()],
  build: {
    lib: {
      entry: 'src/givtcp-battery-card.ts',
      formats: ['es'],
    },
    rollupOptions: {},
  },
  optimizeDeps: {
    disabled: true,
  },
});
