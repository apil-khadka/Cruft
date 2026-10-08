import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Ignore generated / third-party directories
  {
    ignores: ["dist/**", "src-tauri/target/**", "node_modules/**", "*.cjs", "*.min.js"],
  },

  // TypeScript + React source files
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier, // must be last — disables rules that conflict with Prettier
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow 'any' in some cases (Tauri invoke results, etc.)
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
