// See examples/nextjs-quickstart/eslint.config.mjs for rationale.
import reactConfig from "@blerp/config/eslint-react";

export default [
  ...reactConfig,
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "tests/**", "test-results/**"],
  },
];
