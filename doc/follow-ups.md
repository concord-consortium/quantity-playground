# Follow-ups

Work we've thought about and deferred, with enough context to pick up later.
File issues against these as they bubble up in priority.

## Split the repo into two packages

The repo's single `package.json` serves both a published library
(`@concord-consortium/diagram-view`, built from `src/diagram/` via
`tsconfig-esm.json`/`tsconfig-cjs.json`) and a deployed standalone web page
(built by webpack from `src/index.tsx`). That works, but it has two real
costs:

- `react`/`react-dom` show up in `devDependencies` even though the
  standalone page ships them at runtime. The semantically correct shape is
  `peerDependencies` for the library and `dependencies` for the app.
- The build emits all of `src/` into `dist/` even though the library
  entrypoint is `src/diagram/`. So `src/components/`, `src/hooks/`, and
  `src/utils/` ship in the published tarball regardless of whether they're
  truly part of the library API.

The clean shape is npm or yarn workspaces, e.g.:

```
/
├── package.json            (workspace root, private: true)
├── packages/
│   ├── diagram-view/       library
│   │   └── package.json    react/react-dom in peerDependencies only
│   └── playground/         deployed standalone page
│       └── package.json    react/react-dom in dependencies (real)
```

Benefits:

- Each package declares its true relationship to React.
- Library and deployed app can move independently — e.g., the app can
  experiment with React 19 ahead of (or behind) the library's supported
  range.
- The CI peerDep matrix story gets cleaner: the library is tested via real
  installs at multiple React versions; the app is tested at its own pinned
  version.

Why it's deferred: deciding **what is library code, what is
standalone-page code, and what (if anything) belongs in a third shared
package** is its own design pass. Doing it as part of the React 18 release
would have broadened the blast radius (build, deploy, CI all touched) and
made review harder.

## Migrate from `reactflow` v11 to `@xyflow/react` v12+

The repo currently uses `reactflow@^11.7.2`. The project has rebranded to
`@xyflow/react` for v12+; the `reactflow` v11 line is essentially EOL and
no longer receives meaningful updates.

Concrete symptoms of being on v11:

- Console warning at runtime: `[DEPRECATED] Use 'createWithEqualityFn'
  instead of 'create' or use 'useStoreWithEqualityFn' instead of 'useStore'.
  They can be imported from 'zustand/traditional'.` This comes from
  reactflow v11's internal use of `zustand@4.5.x`. v11 won't be patched.
- `@reactflow/*` packages reference the global `JSX` namespace (which
  `@types/react@19` removed). We work around this with `skipLibCheck: true`
  in [tsconfig.json](../tsconfig.json) — that tolerates the upstream type
  drift but hides any future legitimate type issues across all of
  node_modules. v12's types are React-19-clean.

The upgrade is non-trivial:

- Package rename: every `from "reactflow"` and `from "@reactflow/*"` import
  becomes `from "@xyflow/react"`.
- API changes around node/edge types and a few hooks. v12's docs have a
  v11→v12 migration guide.
- v12 ships ESM-only by default; double-check our CJS build still works.

Best done as its own focused PR after the React 18 release is out.

## Migrate Cypress tests to Playwright

We want to move our end-to-end tests from Cypress to Playwright as a
general-purpose modernization (faster runs, real browser keyboard/mouse
events, better debugging, single tool across our repos). This is a
follow-up regardless of anything else.

It also gives us a cheap path past one specific known issue. In
`cypress/e2e/diagram.test.ts`, an edge used to be deleted by pressing the
Backspace key; that stopped working when we moved to React 18 in PR #91.
Rather than block the React 18 release on diagnosing it, the test was
reworked to click the delete button instead. The workaround is correct
but the underlying question — why did Backspace stop firing the delete in
our diagram under React 18? — was never answered. Most likely candidate
is Cypress's synthesized keyboard events interacting badly with React
18's batching, but it could also be a reactflow v11 quirk.

The recommendation: don't spend cycles diagnosing the Cypress side. Do
the Playwright migration instead, then re-add a real Backspace-press
keyboard test against the diagram. If the migration fixes the symptom
"for free" (likely, since Playwright dispatches real keyboard events
through CDP), great. If not, we're at most where we'd have been
diagnosing it standalone, but with the broader migration value already
banked.
