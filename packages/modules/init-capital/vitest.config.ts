import tsconfigPaths from 'vite-tsconfig-paths'

import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'init-capital',
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
