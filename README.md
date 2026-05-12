# Quantity Playground (aka Diagram View)

## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

#### Run using HTTPS

Additional steps are required to run using HTTPS.

1. install [mkcert](https://github.com/FiloSottile/mkcert) : `brew install mkcert` (install using Scoop or Chocolatey on Windows)
2. Create and install the trusted CA in keychain if it doesn't already exist:   `mkcert -install`
3. Ensure you have a `.localhost-ssl` certificate directory in your home directory (create if needed, typically `C:\Users\UserName` on Windows) and cd into that directory
4. Make the cert files: `mkcert -cert-file localhost.pem -key-file localhost.key localhost 127.0.0.1 ::1`
5. Run `npm run start:secure` to run `webpack-dev-server` in development mode with hot module replacement

Alternately, you can run secure without certificates in Chrome:

1. Enter `chrome://flags/#allow-insecure-localhost` in Chrome URL bar
2. Change flag from disabled to enabled
3. Run `npm run start:secure:no-certs` to run `webpack-dev-server` in development mode with hot module replacement

### Building

If you want to build a local version run `npm run build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Testing

### Jest

Run `npm test` to run jest tests.

### Cypress

Run `npm run test:full` to run jest and Cypress tests.

#### Cypress Run Options

Inside of your `package.json` file:

1. `--browser browser-name`: define browser for running tests
2. `--group group-name`: assign a group name for tests running
3. `--spec`: define the spec files to run
4. `--headed`: show cypress test runner GUI while running test (will exit by default when done)
5. `--no-exit`: keep cypress test runner GUI open when done running
6. `--record`: decide whether or not tests will have video recordings
7. `--key`: specify your secret record key
8. `--reporter`: specify a mocha reporter

#### Cypress Run Examples

1. `cypress run --browser chrome` will run cypress in a chrome browser
2. `cypress run --headed --no-exit` will open cypress test runner when tests begin to run, and it will remain open when tests are finished running.
3. `cypress run --spec 'cypress/integration/examples/smoke-test.js'` will point to a smoke-test file rather than running all of the test files for a project.

### Testing in CLUE and other projects

The diagram-view is used in CLUE in the diagram tile, and possibly other projects as well. As you're making changes to this library, it can be helpful to test those changes within client projects without deploying. This can be done with yalc.

[yalc](https://www.npmjs.com/package/yalc) provides an alternative to `npm link`. It acts as a very simple local repository for locally developed packages that can be shared across a local environment. It provides a better workflow than `npm | yarn link` for package authors. There are scripts in package.json to make this easier.

To publish an in-development version of diagram-view to the local yalc store, run from this repo:

`npm run yalc:publish`

This builds and publishes the library at version `0.0.0-development` (the committed source-of-truth version; see "Publishing the library to NPM" below for how real versions are stamped in for npm publishes). The `--push` flag in the script also updates any client project that has previously run `yalc add`, so re-running this command after a code change propagates the update automatically.

To consume an in-development version of diagram-view, in the root directory of the client project:

`npx yalc add @concord-consortium/diagram-view@0.0.0-development`

Specifying the version pins the client to the local-development build and ignores any unrelated yalc publishes that might be in the store.

To swap the client back to the registry version temporarily (e.g. before opening a PR), run `yalc retreat` in the client project. To re-apply the yalc version, `yalc restore`. To remove the yalc link permanently, `yalc remove` (then `npm install` to restore the registry version).

`yalc` modifies the `package.json` of the client project with a link to the local `yalc` repository. _This is a good thing!_ as it makes it obvious when you're using an in-development version of a library and serves as a reminder to install a fully published version before pushing to GitHub, etc. It also means that running `npm install` in the client project will not break the setup.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by GitHub Actions
for each branch and tag pushed to GitHub.

Branches are deployed to <https://models-resources.concord.org/quantity-playground/branch/{name}>.
If the branch name starts or ends with a number this number is stripped off.

Tags are deployed to <http://models-resources.concord.org/quantity-playground/version/{name}>.

To deploy a production release:

1. Increment version number in package.json
2. Create new entry in CHANGELOG.md
3. Run `git log --pretty=oneline --reverse <last release tag>...HEAD | grep '#' | grep -v Merge` and add contents (after edits if needed to CHANGELOG.md)
4. Run `npm run build`
5. Copy asset size markdown table from previous release and change sizes to match new sizes in `dist`
6. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
7. Checkout master and pull
8. Create an annotated tag for the version, of the form `v[x].[y].[z]`, include at least the version in the tag message. On the command line this can be done with a command like `git tag -a v1.2.3 -m "1.2.3 some info about this version"`
9. Push the tag to github with a command like: `git push origin v1.2.3`.
10. Use https://github.com/concord-consortium/quantity-playground/releases to make this tag into a GitHub release.
11. Run the release workflow to update https://models-resources.concord.org/quantity-playground/index.html. 
    1. Navigate to the actions page in GitHub and the click the "Release" workflow. This should take you to this page: https://github.com/concord-consortium/quantity-playground/actions/workflows/release.yml. 
    2. Click the "Run workflow" menu button. 
    3. Type in the tag name you want to release for example `v1.2.3`.  (Note this won't work until the PR has been merged to master)
    4. Click the `Run Workflow` button.

## Publishing the library to NPM

The library is published by the `Publish diagram-view to npm` GitHub Actions
workflow (`.github/workflows/publish-library.yml`), triggered by pushing a
`diagram-view-v<semver>` git tag. The committed `package.json` version is
always `0.0.0-development`; the real version is parsed from the tag and
stamped into `package.json` by the workflow before it publishes.

The dist-tag is chosen automatically:

- version contains `-` (prerelease) → `beta`
- otherwise → `latest`

Authentication uses npm trusted publishing (OIDC). No `NPM_TOKEN` secret is
configured; instead, the npm package's "Trusted Publishers" settings list
this repository and this workflow file.

### Cutting a release

1. Decide on the version. Follow semver. Use prerelease suffixes (e.g.
   `2.0.0-pre.0`, `2.0.0-pre.1`, `2.0.0-rc.0`) for prereleases.
1. Make sure the branch you're tagging is green on CI and merged to where
   you want it (typically `main`).
1. Create and push the tag:
    - `git tag diagram-view-v<version>` (e.g. `diagram-view-v2.0.0-pre.0`)
    - `git push origin diagram-view-v<version>`
1. The workflow runs: `npm ci`, `npm run check:types`, `npm test`, then
   stamps the version into `package.json` and runs `npm publish`. Watch it
   under the Actions tab.
1. After it completes, verify on
   <https://www.npmjs.com/package/@concord-consortium/diagram-view>.

The `diagram-view-v` tag prefix leaves the `v<semver>` namespace free for
standalone-app releases (see "Releasing the standalone app" above), since
this repo serves both roles from one `package.json`.

### Local dry-run

`npm run publish:test` runs `npm publish --dry-run` and prints the tarball
contents. Useful for checking what files would ship before tagging. It does
not contact the registry.

For testing the library in a consumer project before publishing, see
"Testing in CLUE and other projects" above.

## License

Quantity Playground is Copyright 2024 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
