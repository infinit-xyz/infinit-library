import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'aave-v3',
    setupFiles: ['./test/setup.ts'],
    hookTimeout: 100_000,
    testTimeout: 100_000,
    retry: 5,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
