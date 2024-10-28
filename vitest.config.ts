import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html', 'json-summary'],
      provider: 'v8',
      exclude: [
        'packages/test',
        'scripts',
        'packages/**/scripts/**',
        '**/*.config.*',
        '**/dist/**',
        'node_modules/**',
        '**/artifacts/**',
        '**/cache/**',
        '**/contracts/**',
        '**/__mocks__/**',
      ],
    },
    testTimeout: 25000,
    hookTimeout: 15000,
    globalSetup: [path.resolve(__dirname, 'packages/test/src/globalSetup.ts')],
    setupFiles: [path.resolve(__dirname, 'packages/test/src/setup.ts')],
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
