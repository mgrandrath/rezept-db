module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "react-app", // loads @typescript-eslint plugin
    "react-app/jest",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-unused-vars": "off", // produces duplicates of '@typescript-eslint/no-unused-vars'
    "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
  },
  overrides: [
    {
      files: ["_*.spec.ts"],
      env: {
        jest: true,
      },
    },
  ],
};
