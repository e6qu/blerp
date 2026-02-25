import reactConfig from "@blerp/config/eslint-react";

export default [
  ...reactConfig,
  {
    ignores: ["dist/**"],
  },
];
