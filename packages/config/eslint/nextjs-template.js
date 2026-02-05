import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-plugin-prettier';
import turboPlugin from 'eslint-plugin-turbo';

/**
 * ESLint configuration for Next.js template applications.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsTemplateConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'dist/**'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier: prettier,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
