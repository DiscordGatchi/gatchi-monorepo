import { build } from 'esbuild'
import { resolve } from 'node:path'

const fromPath = (...paths: string[]) => resolve(__dirname, ...paths)

build({
  entryPoints: [fromPath('src', 'test', 'index.tsx')],
  outdir: fromPath('dist'),
  inject: [fromPath('src', 'shim.ts')],
}).then(() => process.exit(0))
