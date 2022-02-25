// build/production configuration extends default/development configuration
module.exports = {
    extends: "./.eslintrc.js",
    rules: {
      "no-console": ["warn", { allow: ["log", "warn", "error"] }],
      "no-debugger": "error"
    }
};
