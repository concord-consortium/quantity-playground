// Stamped by .github/workflows/publish-library.yml at publish time via a sed
// command. Local/dev builds (and yalc-published copies) keep the
// "0.0.0-development" default — matches the committed package.json version.
// Consumers can use this to detect "I'm running against a dev build."
//
// Ideally this file would just do `import pkg from "../../package.json";
// export const version = pkg.version;` so package.json is the single source of
// truth and the publish workflow doesn't need to know this file exists. That
// works in sibling libraries built with webpack, rollup, or tsup — those
// bundlers inline JSON imports at build time, so the published bundle has the
// version baked in and never reads package.json at runtime.
//
// This package is built with `tsc` directly (see the `tsc` script in
// package.json), and tsc preserves JSON imports as runtime `require`/`import`
// statements rather than inlining them. After compilation, the relative path
// would resolve against the `dist/` layout where package.json isn't present,
// so the runtime import would fail. The workflow therefore stamps this
// constant in place as a separate step before `npm publish` runs `tsc`.
export const version = "0.0.0-development";
