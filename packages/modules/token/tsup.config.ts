import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'token',
  entry: ['src/index.ts', 'src/actions/index.ts', 'src/utils/index.ts'],
  format: ['esm', 'cjs'], // Build for ESmodules and Commonjs
  dts: true, // Generate declaration file (.d.ts)
  sourcemap: false,
  clean: true,
  splitting: true,
  keepNames: true,
  // https://github.com/evanw/esbuild/issues/1921#issuecomment-1152991694
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  external: ['@openzeppelin/contracts', '@openzeppelin/contracts-upgradeable', '@openzeppelin/merkle-tree'],
})
