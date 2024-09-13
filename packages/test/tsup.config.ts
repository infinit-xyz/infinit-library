import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // Build for ESmodules
  dts: true, // Generate declaration file (.d.ts)
  sourcemap: false,
  clean: true,
  splitting: true,
})
