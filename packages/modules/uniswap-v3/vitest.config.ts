import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'uniswap-v3',
    hookTimeout: 100_000,
    testTimeout: 100_000,
    retry: 10,
    setupFiles: [path.resolve(__dirname, '../../test/src/setupFiles/resetTestClient.ts')],
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
