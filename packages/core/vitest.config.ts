import tsconfigPaths from 'vite-tsconfig-paths'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'core',
    mockReset: true,
  },
  plugins: [tsconfigPaths()], // to resolve imports using Typescipt's path mapping
})
