import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'aave-v3',
    setupFiles: ['./test/setup.ts'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
