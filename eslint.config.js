import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default tseslint.config(
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.wrangler/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.svelte'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/require-each-key': 'off',
      'svelte/prefer-writable-derived': 'off',
      'svelte/valid-prop-names-in-kit-pages': 'off',
      'svelte/no-at-html-tags': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.svelte'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', 'no-undef': 'off' }
  }
);
