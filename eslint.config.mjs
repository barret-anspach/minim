import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylisticJs from "@stylistic/eslint-plugin-js";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "prettier",
    ),
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "@stylistic/js": stylisticJs,
      prettier,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-console": 1,
      "prettier/prettier": [
        "error",
        {
          semi: true,
        },
      ],
      "@stylistic/js/semi": ["error", "always"],
    },
    ignores: ["dist/**"],
  },
]);
