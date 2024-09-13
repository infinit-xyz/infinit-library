import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'uniswap-v3',
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
