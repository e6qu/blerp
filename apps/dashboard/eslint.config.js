// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import reactConfig from "@blerp/config/eslint-react";

export default [
  ...reactConfig,
  {
    ignores: ["dist/**", "tests/**"],
  },
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "storybook/no-renderer-packages": "off",
    },
  },
];
