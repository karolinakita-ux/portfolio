import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import jestDom from "eslint-plugin-jest-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Vertical-slice boundaries (see CLAUDE.md, Layout): app -> features -> shared, never back.
 * Features never import each other, and the app reaches a feature only through its index.ts.
 */
const NO_PARENT_IMPORTS = {
  group: ["../*"],
  message: "Import across folders with #app/*, #features/* or #shared/* instead of ../",
};
const boundaries = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns: [...patterns, NO_PARENT_IMPORTS] }],
});

export default defineConfig([
  // Build output, reports and local-only files (see .gitignore)
  globalIgnores(["dist", "coverage", "a11y-report", ".claude", "docs/_*", "notes", "private", "scratch", "tmp"]),
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // `const { as, variant, ...rest } = props` strips own props before spreading the rest.
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true, argsIgnorePattern: "^_" }],
      // Numbers in strings are fine ("Step " + n); objects and nullish values are not.
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/restrict-plus-operands": ["error", { allowNumberAndString: true }],
      // `onClick={() => setOpen(true)}` is the React idiom.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/array-type": ["error", { default: "array-simple", readonly: "array-simple" }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    },
  },
  {
    files: ["src/**/*.tsx"],
    extends: [eslintReact.configs["recommended-type-checked"], jsxA11y.flatConfigs.recommended],
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: boundaries({ group: ["#app/*", "#features/*"], message: "Shared code must not depend on app or features." }),
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: boundaries(
      { group: ["#app/*"], message: "Features must not depend on the app shell." },
      {
        group: ["#features/*"],
        message: "Features never import each other: move shared code to #shared, compose in #app.",
      },
    ),
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: boundaries({
      group: ["#features/*/*", "!#features/*/index.ts"],
      message: "Import a feature through its index.ts.",
    }),
  },
  {
    // Content modules export data (some with JSX): Fast Refresh does not apply, and the views
    // add keys when they render these arrays.
    files: ["src/**/*.content.{ts,tsx}", "src/features/*/index.ts", "src/app/prerender.entry.tsx"],
    rules: { "react-refresh/only-export-components": "off", "@eslint-react/no-missing-key": "off" },
  },
  {
    // Tests may reach into any slice; they export nothing, so Fast Refresh does not apply.
    files: ["src/**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    extends: [vitest.configs.recommended, testingLibrary.configs["flat/react"], jestDom.configs["flat/recommended"]],
    rules: {
      "no-restricted-imports": "off",
      "react-refresh/only-export-components": "off",
      // Mocks and stubs: empty callbacks, async helpers and known-present nodes are normal here.
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      // Image skeletons, <dialog> internals and focus checks have no role to query by.
      "testing-library/no-node-access": "off",
      // expect(value, message): the message names the failing asset or bullet.
      "vitest/valid-expect": ["error", { maxArgs: 2 }],
    },
  },
  {
    // Data-driven checks over every content entry: optional fields are checked only when present.
    files: ["src/app/content-rules.test.ts"],
    rules: { "vitest/no-conditional-expect": "off" },
  },
  {
    files: ["*.config.{js,ts}", "scripts/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  // Last: turns off stylistic rules that would fight Prettier.
  eslintConfigPrettier,
]);
