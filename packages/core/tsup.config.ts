import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'core',
  entry: [
    'src/exports/index.ts',
    'src/exports/internal/index.ts',
    'src/exports/errors.ts',
    'src/exports/internal/hardhat-compile.ts',
    'src/exports/internal/hardhat-base.config.ts',
    'src/types/action.ts',
    'src/types/callback.ts',
    'src/types/cache.ts',
  ],
  format: ['esm', 'cjs'], // Build for ESmodules and Commonjs
  dts: true, // Generate declaration file (.d.ts)
  sourcemap: false,
  clean: true,
  splitting: true,
  keepNames: true,
})
