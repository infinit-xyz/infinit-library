import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'uniswap-v3',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    setupFiles: [path.resolve(__dirname, '../../test/src/setupFiles/resetTestClient.ts')],
    retry: 3,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
