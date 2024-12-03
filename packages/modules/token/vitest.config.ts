import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'token',
    hookTimeout: 100_000,
    testTimeout: 100_000,
    retry: 10,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
