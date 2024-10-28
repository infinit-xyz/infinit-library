import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'core',
    mockReset: true,
    testTimeout: 10_000,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
