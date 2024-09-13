import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 8,
      },
    },
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html', 'json-summary'],
      provider: 'istanbul',
      exclude: ['**/*.config.*'],
    },
    testTimeout: 25000,
    hookTimeout: 15000,
    globalSetup: [path.resolve(__dirname, 'packages/test/src/globalSetup.ts')],
    setupFiles: ['./packages/test/src/setup.ts'],
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
