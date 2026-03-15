export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      '.github/**',
      'coverage/**',
      'public/**',
      '*.generated.*',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
