module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:import/typescript",
    "plugin:import/recommended",
    "plugin:valtio/recommended",
    "plugin:lit/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "tailwindcss",
    "unused-imports",
    "import",
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "unused-imports/no-unused-imports": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": ["error"],
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
}
