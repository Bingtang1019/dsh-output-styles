import { defineConfig } from 'tsdown'
import { clientHandoff } from './scripts/client-handoff.mjs'

/**
 * Consumer-side browser bundle for Git and tarball installs: the `dsh.client`
 * entry, bundled without any repository project references, and emitted as the
 * module-table registration the Host loads (see scripts/client-handoff.mjs).
 */
export default defineConfig({
  entry: {
    client: 'src/client/index.ts',
  },
  outDir: 'lib',
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  fixedExtension: false,
  dts: false,
  clean: false,
  tsconfig: 'tsconfig.prepare.json',
  outputOptions: clientHandoff,
})
