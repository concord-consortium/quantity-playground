import path from "path";
import visualizer from "rollup-plugin-visualizer";
import dts from "rollup-plugin-dts";
import external from "rollup-plugin-peer-deps-external";
import replace from "rollup-plugin-re";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";

import packageJson from "./package.json";

export default [{
  input: "../src/diagram/index.ts",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: packageJson.module,
      format: "es",
      sourcemap: true
    }
  ],
  // ignore spurious warning
  onwarn(warning, warn) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
  plugins: [
    // exclude peer dependencies from bundle
    external(),
    resolve({
      browser: true
    }),
    typescript(),
    commonjs({
      // note: use of regex isn't documented but is clearly supported by code
      include: [/node_modules/]
    }),
    postcss({
      extract: path.resolve("dist/index.css")
    }),
    visualizer({ open: false }) // <== set to true to automatically open visualizer on build
  ]
}, { // bundle declaration files
  // declaration files root
  input: "dist/diagram/index.d.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [
    replace({
      patterns: [{
        // match types files
        match: /\.d\.ts/,
        // ignore .[s]css imports when bundling types
        test: /import ["'](.*)\.s?css['"];/g,
        // string to replace with
        replace: ""
      }]
    }),
    // bundle types into a single index.d.ts file
    dts()
  ]
}
];
