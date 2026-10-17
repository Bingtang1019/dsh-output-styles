import { defineConfig } from 'tsdown'
import { clientHandoff } from './scripts/client-handoff.mjs'

export default defineConfig({
  entry: {
    client: 'lib/types/client/index.js',
  },
  outDir: 'lib',
  // The client half is a module-table registration, not an ES module: the Host
  // renders it as a classic `<script src>` and reads exports from the
  // registration. See scripts/client-handoff.mjs.
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  fixedExtension: false,
  dts: false,
  clean: false,
  outputOptions: clientHandoff,
})
