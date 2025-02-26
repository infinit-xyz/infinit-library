import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'pendle',
    // setupFiles: ['./test/setup.ts'],
    testTimeout: 30_000,
    retry: 3,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
