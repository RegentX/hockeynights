import path from 'node:path'

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

/** @spec SPEC-NFR-2 - Stub CSS imports in Vitest */
function vitestCssStub() {
  return {
    name: 'vitest-css-stub',
    enforce: 'pre' as const,
    load(id: string) {
      if (id.endsWith('.css') || id.endsWith('.scss')) {
        return 'export default {}'
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...(process.env.VITEST ? [vitestCssStub()] : [])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.spec.ts', 'src/test/**/*.spec.tsx'],
    css: true,
    server: {
      deps: {
        inline: [/@gravity-ui\/.*/],
      },
    },
  },
})
