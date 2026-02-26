import baseConfig from "@blerp/config/eslint-base";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**"],
  },
];
