import baseConfig from './eslint.base.config.mjs';
import nx from '@nx/eslint-plugin';

export default [
  ...baseConfig,

  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },

  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },

  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],

  // ⭐ GLOBAL OVERRIDE — must be last and must NOT have "files"
  {
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['@analogjs/vitest-angular/*'],
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ccs3-op',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ccs3-op',
          style: 'kebab-case',
        },
      ],
    },
  },

  {
    files: ['**/*.html'],
    rules: {},
  },
];
