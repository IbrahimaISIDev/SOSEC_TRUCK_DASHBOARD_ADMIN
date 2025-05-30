module.exports = {
  env: { node: true, es2021: true },
  extends: ["airbnb-base", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 12, sourceType: "module" },
  plugins: ["@typescript-eslint"],
  rules: { "import/extensions": ["error", "ignorePackages", { ts: "never" }] }
};
