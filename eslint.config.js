import raycastEslintConfig from "@raycast/eslint-config" // Renamed for clarity
// eslint.config.js
import globals from "globals"

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...(Array.isArray(raycastEslintConfig) ? raycastEslintConfig : [raycastEslintConfig]),
]
