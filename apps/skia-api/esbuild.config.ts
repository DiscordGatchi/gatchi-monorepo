import { build } from 'esbuild'

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
  target: 'node16',
  external: ['skia-canvas', 'sharp'],
}).then(() => process.exit(0))
