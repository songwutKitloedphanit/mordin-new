import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import sortClassMembersPlugin from 'eslint-plugin-sort-class-members';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    ignores: ['dist/**', '.eslintrc.cjs'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      sonarjs: sonarjsPlugin,
      'sort-class-members': sortClassMembersPlugin,
      'unused-imports': unusedImportsPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          tabWidth: 2,
          semi: true,
          printWidth: 80,
          bracketSpacing: true,
          arrowParens: 'avoid',
          endOfLine: 'auto',
        },
      ],
      // Keep other rules from your current configuration
      'react-hooks/rules-of-hooks': 'error',
      // Import plugin rules
      'import/default': 'error',
      'import/namespace': 'error',
      'import/export': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/ban-types': 'off',
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'sort-class-members/sort-class-members': [
        'error',
        {
          order: [
            '[static-properties]',
            '[static-methods]',
            '[conventional-private-properties]',
            '[private-properties]',
            '[properties]',
            '[abstract-methods]',
            'constructor',
            '[conventional-private-methods]',
            '[private-methods]',
            '[methods]',
          ],
          groups: {
            'private-properties': [
              { type: 'property', accessibility: 'private' },
            ],
            'private-methods': [{ type: 'method', accessibility: 'private' }],
            'abstract-methods': [{ type: 'method', abstract: true }],
          },
          accessorPairPositioning: 'getThenSet',
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'off',
            properties: 'off',
          },
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'comma-dangle': ['error', 'only-multiline'],
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: ['error', 'always'],
      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],
      'no-fallthrough': 'warn',
      'no-useless-return': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      yoda: 'error',
    },
  },
  prettier,
];
