import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'init-capital',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 100_000,
    hookTimeout: 100_000,
    retry: 5,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
