import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    files: ["**/*.{js,ts,mjs,mts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Omit `project` here so ESLint doesn't require this config file to be included in tsconfig.json
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
]);
