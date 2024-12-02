import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'init-capital',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 70_000,
    hookTimeout: 70_000,
    retry: 3,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
