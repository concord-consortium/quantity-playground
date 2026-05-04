# Updating `@concord-consortium/diagram-view` for React 18 (and 19)

A standalone plan for getting `@concord-consortium/diagram-view` (the package
published from `concord-consortium/quantity-playground`) compatible with
React 18 and 19. We are **not** keeping React 17 support: dropping it sidesteps
the React 17 → 18 `@types/react` `children`-prop change, which would otherwise
require a source-wide audit.

## Background

The package is built from
<https://github.com/concord-consortium/quantity-playground>. As of the latest
published version (`1.0.2`), `peerDependencies` declare
`react: ^17.0.2`/`react-dom: ^17.0.2`, which prevents any consumer from
installing React 18 alongside it.

### The repo has one `package.json` for two roles

The repo's single `package.json` serves both:

- A **library** published as `@concord-consortium/diagram-view`: TS compiled
  from `src/diagram/` via `tsconfig-esm.json` and `tsconfig-cjs.json`
  (excludes `*.test.*` files). `main`/`module` point at
  `dist/cjs/diagram/index.js` and `dist/esm/diagram/index.js`.
- A **standalone web page** built by webpack from `src/index.tsx` and deployed.

Because there's only one `package.json`, the library's `peerDependencies`
(what consumers must provide) and the standalone page's runtime deps (what
the deployed site needs) live side by side. The standalone page picks up
`react`/`react-dom` from the dev install. So when we choose a React version
to develop against, the standalone page also runs against that version —
they aren't isolated.

That's fine for our purposes. Just worth knowing: a single React install
covers both roles.

There is already an open PR for this work:
[**PR #91 "Update to React v18."**](https://github.com/concord-consortium/quantity-playground/pull/91)

- Opened 2024-02-01 by Teale Fristoe.
- Approved by Scott Cytacki on 2024-10-11.
- Last activity: 2024-10-11.
- Currently has merge conflicts with `main` (main has shipped 1.0.0 and
  1.0.1 since the PR was opened).
- The PR body documents one known issue: the cypress `diagram.test.ts`
  keyboard-delete step stopped working; the test was reworked to click the
  delete button instead of pressing Backspace.

## What PR #91 already does

Verified against the `origin/react18` branch:

- `peerDependencies` widened: `react: ">=18"`, `react-dom: "^18.2.0"`.
- `src/index.tsx` migrated from `ReactDOM.render(...)` to
  `createRoot(...).render(...)`. This is the only legacy ReactDOM call
  in the source — no `findDOMNode`, no `hydrate`, no
  `unmountComponentAtNode`.
- Cypress test rewritten to click the delete button.
- `package-lock.json` regenerated.

For the new release we want to tighten the peerDep range: we should declare
`react: "^18.0.0 || ^19.0.0"` (and same for `react-dom`) so consumers know
both majors are supported, rather than the loose `>=18` currently in the PR.

## What PR #91 is missing for a clean React 18 update

| Issue | Why it matters | Fix |
|---|---|---|
| `@types/react` still pinned at `^17.0.75` | Mismatch with `@types/react-dom@^18.2.18`; types will be wrong. | Bump `@types/react` to `^18`. |
| `@testing-library/react` still at `^12.1.2` | v12 doesn't support React 18 properly (no automatic batching, etc.). | Bump to `^14` or `^16`. |
| `@testing-library/react-hooks: ^7.0.2` still in devDeps | The whole package is **React-17-only and deprecated**. Its functionality moved into `@testing-library/react@13+` as `renderHook`. | Remove the dep; migrate `src/hooks/use-sample-text.test.ts` to import `renderHook` from `@testing-library/react`. |
| Version bump in PR (`1.0.0-beta.2` from `1.0.0-beta.1`) | Main has published 1.0.0 and 1.0.1 since the PR was opened. | Pick a new version (e.g., `2.0.0`, since the peer-dep widening is a breaking change for any consumer still on React 17). |

## Other dependencies — already React 18 compatible

The PR did not need to update these and they don't block the upgrade. They
are all worth bumping during the same release for hygiene, but none are
required.

| Dep | Pinned | Latest | Notes |
|---|---|---|---|
| `react-color` | `^2.19.3` | `2.19.3` | peerDep `react: '*'`. Unmaintained but works. |
| `react-textarea-autosize` | `^8.3.4` | `8.5.9` | peerDep covers React 16–19. |
| `reactflow` | `^11.7.2` | `11.11.4` | peerDep `react: ">=17"`. (`reactflow` v12+ was renamed to `@xyflow/react`; sticking with v11 keeps the upgrade scoped.) |

## Supporting React 18 and 19 from one published version

We want the new release to support React 18 *and* React 19. The pattern is
straightforward:

- `peerDependencies`: `react: "^18.0.0 || ^19.0.0"` (and same for
  `react-dom`). This is what consumers see.
- `devDependencies`: pick one concrete version to develop against (React 18
  is the conservative choice — code that compiles against React 18 types
  will compile against React 19 types, but not always the reverse). Pin
  `@types/react` and `@types/react-dom` to that same major.
- **CI matrix**: the peerDep range is only a promise; CI is what verifies
  it. Add a job that installs each supported version on top of the base
  install and runs the test/typecheck suites against it. For example:

  ```yaml
  strategy:
    matrix:
      react: ["18.2.0", "19.0.0"]
  steps:
    - run: npm ci
    - run: npm install --no-save \
             react@${{ matrix.react }} \
             react-dom@${{ matrix.react }} \
             @types/react@${{ matrix.react }} \
             @types/react-dom@${{ matrix.react }}
    - run: npm run check:types
    - run: npm test
  ```

Without the matrix, "supports 18 and 19" is aspirational. With it, every PR
proves the claim.

## Path forward

1. Pull the `react18` branch and merge `main` into it; resolve conflicts.
2. Tighten the peerDep range from `>=18` to `^18.0.0 || ^19.0.0`.
3. Apply the four fixes in the table above:
   - bump `@types/react` to ^18,
   - bump `@testing-library/react` to ^14 or ^16,
   - remove `@testing-library/react-hooks` and migrate the one test file
     that uses it,
   - re-pick the version (e.g., `2.0.0`).
4. Add a React-18/19 CI matrix as described above.
5. Investigate the cypress keyboard-delete failure if you want a fix
   instead of the click-the-button workaround. Otherwise leave the
   workaround in place — it's not a regression in the package itself.
6. Cut a new release.
7. Update CLUE (and any other consumers) to depend on the new version and
   remove the React-17-only peerDep entry from the React 18 blockers list.

The bulk of the work is already done in PR #91; what's left is finishing
the testing-library migration, broadening peerDeps to cover React 19, and
unsticking the PR.

## Future work: split the repo into two packages

**Out of scope for the React 18 release. File as a follow-up.**

The current single-`package.json` shape misclassifies `react`/`react-dom` as
`devDependencies` even though the standalone web page is deployed online
and ships them at runtime. The semantically correct layout is two
packages, e.g. with npm or yarn workspaces:

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

- Each package declares its true relationship to React. The standalone
  page's runtime deps stop hiding under `devDependencies`.
- The library and the deployed app can move at different cadences —
  e.g., the app can experiment with React 19 ahead of (or behind) the
  library's supported range.
- The CI matrix story gets cleaner: the library is tested via real
  installs at multiple React versions; the app is tested at its own
  pinned version.

Why it's deferred:

- It's a non-trivial restructure. The current build emits all of `src/`
  into `dist/` even though the library entrypoint is `src/diagram/`. So
  `src/components/`, `src/hooks/`, and `src/utils/` ship in the published
  tarball today regardless of whether they're truly part of the library.
  Splitting cleanly means **deciding what is library code, what is
  standalone-page code, and what (if anything) belongs in a third shared
  package** — that's its own design pass.
- It's not blocking React 18. PR #91 works in the current shape, and the
  published package's `peerDependencies` already convey the right
  contract to consumers.
- Mixing this restructure into the React 18 release would broaden the
  blast radius (build, deploy, CI all touched) and make review harder.

A follow-up issue should capture the "what's library vs app" sorting work
along with the workspace setup.
