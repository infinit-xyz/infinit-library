import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'token',
  },
  testTimeout: 25000,
  hookTimeout: 15000,
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
