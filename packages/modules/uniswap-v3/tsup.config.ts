import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'uniswap-v3',
  entry: ['src/index.ts', 'src/actions/index.ts', 'src/utils/index.ts'], // Entry points
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
  external: [
    'base64-sol',
    '@openzeppelin/contracts-3.4.1-solc-0.7-2',
    '@openzeppelin/contracts-3.4.2-solc-0.7',
    '@openzeppelin/contracts-4.7.0',
    'base64-sol',
    'solmate',
  ],
})
