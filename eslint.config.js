import raycastConfigArray from "@raycast/eslint-config"; // Renamed for clarity, it's an array
// eslint.config.js
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Since raycastConfigArray is an array, spread its elements here
  ...raycastConfigArray,
];