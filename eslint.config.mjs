// eslint.config.js
import ts from "@eslint/ts";

export default [
  ts.configs.recommended,

  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
];
