#### Using yalc to test this is CLUE

[yalc](https://www.npmjs.com/package/yalc) provides an alternative to `npm link`. It acts as a very simple local repository for locally developed packages that can be shared across a local environment. It provides a better workflow than `npm | yarn link` for package authors. There are scripts in package.json to make this easier. 

To publish an in-development version of the diagram-view library, in this diagram-view directory run:
```
$ npm run yalc:publish
```

To consume an in-development version of the diagram-view library, in the root directory of the client project:
```
$ npx yalc add @concord-consortium/diagram-view
```

To update all clients that are using the in-development version of diagram-view, in the diagram-view project:
```
$ npm run yalc:publish
```

`yalc` modifies the `package.json` of the client project with a link to the local `yalc` repository. _This is a good thing!_ as it makes it obvious when you're using an in-development version of a library and serves as a reminder to install a fully published version before pushing to GitHub, etc. It also means that running `npm install` in the client project will not break the setup.

## Publishing the diagram-view library

1. Change directories into the diagram-view directory
1. Update the version number in `package.json` and `package-lock.json`
    - `npm version --no-git-tag-version [patch|minor|major]`
    - NOTE: we are not currently updating the version number of the root `package.json`, just 
    `diagram-view/package.json`
1. Verify that everything builds correctly
    - `npm run lint && npm run test && npm run build`
1. Commit and push the changes either directly or via GitHub pull request
1. Create/push a tag for the new version (e.g. v0.5.0) and a description (e.g. Release 0.5.0)
    - This can be done in a local git client or on the releases page of the GitHub repository
1. Publish new release on releases page of GitHub repository
1. Test a dry-run of publishing the package to the npm repository
    - `npm publish --access public --dry-run`
1. Publish the package to the npm repository
    - `npm publish --access public`