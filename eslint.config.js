import baseConfig from "@blerp/config/eslint-base";

export default [
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**", "**/.next/**"] },
  ...baseConfig,
  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**", ".next/**"],
  },
];
