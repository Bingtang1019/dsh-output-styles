/**
 * Module-table handoff for the browser client half.
 *
 * The DSH Host serves every plugin bundle to the page as a classic script
 * (`<script src>` with no `type="module"`) and the client module system takes a
 * package's exports only from the registration that script performs
 * (`window.__ModuleLoader__.load({ id, factory })`). A bare ES module therefore
 * both fails to parse and registers nothing.
 *
 * These output options emit that registration around the bundle, matching the
 * harness's own client-bundle preset (`deepseek-harness`
 * `packages/client/tsdown.client.ts`: `format: 'cjs'`, banner, intro, footer).
 *
 * @module dsh-output-styles/scripts/client-handoff
 */

/** Plugin id the registration and the client module table are keyed by. */
const CLIENT_ID = 'dsh-output-styles'

/** Rollup/rolldown output options turning the entry's exports into one registration. */
export const clientHandoff = {
  // The `./client` export and the Host bundle route both address `lib/client.js`;
  // a bare `format: ['cjs']` would otherwise resolve to `client.cjs`.
  entryFileNames: 'client.js',
  banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(CLIENT_ID)}, factory: (require) => {`,
  intro: 'var module = { exports: {} }; var exports = module.exports;',
  footer: 'return module.exports; } });',
}
