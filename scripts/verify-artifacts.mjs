// Verify the built artifacts after `pnpm run build`: syntax-check the host,
// invariant, and client bundles, import the ESM host faces under plain Node,
// and assert the shipped files the plugin's public exports need. Guards
// against TypeScript-only syntax leaking into shipped output and against a
// tarball missing the bundle patch.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const required = [
  'lib/index.js',
  'lib/invariant.js',
  'lib/client.js',
  'lib/types/index.d.ts',
  'lib/types/invariant.d.ts',
  'cordis.patch.yml',
]
for (const rel of required) {
  if (!existsSync(path.join(root, rel))) throw new Error(`missing artifact: ${rel}`)
}

// 1. Syntax-check every JS bundle (plain Node parse; no execution).
for (const rel of ['lib/index.js', 'lib/invariant.js', 'lib/client.js']) {
  execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'inherit' })
}

// 2. The ESM host face must import under plain Node (no tsx, no checkout paths).
const index = await import(pathToFileURL(path.join(root, 'lib/index.js')).href)
if (typeof index.apply !== 'function' || index.name !== 'dsh-output-styles') {
  throw new Error('lib/index.js exports an unexpected plugin face')
}

// 3. The invariant companion face must import and expose its installer.
const invariant = await import(pathToFileURL(path.join(root, 'lib/invariant.js')).href)
if (typeof invariant.installInvariant !== 'function' || invariant.PACKAGE_NAME !== 'dsh-output-styles') {
  throw new Error('lib/invariant.js exports an unexpected invariant face')
}

// 4. The client bundle is a module-table registration, not an ES module: the
// Host renders it as a classic `<script src>` and the client module system
// reads exports only from the registration the script performs.
const clientScript = new vm.Script(readFileSync(path.join(root, 'lib/client.js'), 'utf8'), {
  filename: 'lib/client.js',
})
const registrations = []
const window = { __ModuleLoader__: { load: (registration) => registrations.push(registration) } }
clientScript.runInNewContext({ window })
if (registrations.length !== 1) {
  throw new Error(`lib/client.js registers ${registrations.length} factories, expected one`)
}
const [registration] = registrations
if (registration.id !== 'dsh-output-styles') {
  throw new Error(`lib/client.js registers "${registration.id}", expected "dsh-output-styles"`)
}
const client = registration.factory((specifier) => {
  throw new Error(`lib/client.js requested external "${specifier}"; the client bundle must be self-contained`)
})
if (typeof client.apply !== 'function' || client.name !== 'dsh-output-styles-client' || !Array.isArray(client.inject)) {
  throw new Error('lib/client.js exports an unexpected client face')
}

console.log('artifacts OK: syntax + ESM host imports + client registration + bundle patch present')
