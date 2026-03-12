import boundaries from 'eslint-plugin-boundaries';
import tsParser from '@typescript-eslint/parser';

/**
 * Optional local feedback layer.
 * Use dependency-cruiser as the authoritative CI policy.
 */
export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/ignore': [
        'src/content/generated/**',
        'src/content/i18n/static/**',
        'src/i18n/static/**',
        '**/*.spec.*',
        '**/*.test.*',
      ],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'ui', pattern: 'src/ui/**' },
        { type: 'features', pattern: 'src/features/*/**', capture: ['feature'] },
        { type: 'state', pattern: 'src/state/**' },
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'platform', pattern: 'src/platform/**' },
        { type: 'infra', pattern: 'src/infra/**' },
        { type: 'content', pattern: 'src/content/**' },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: ['app', 'ui', 'features', 'state', 'platform', 'infra', 'content'],
            },
            { from: 'ui', allow: ['ui'] },
            { from: 'features', allow: ['ui', 'state', 'domain', 'platform', 'infra', 'content'] },
            { from: 'state', allow: ['state', 'domain', 'infra'] },
            { from: 'domain', allow: ['domain', 'infra'] },
            { from: 'platform', allow: ['platform', 'domain', 'infra'] },
            { from: 'infra', allow: ['infra'] },
            { from: 'content', allow: ['content'] },
          ],
        },
      ],
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'domain',
              disallow: [
                'react',
                'react-dom',
                'react-i18next',
                '@capacitor/*',
                '@sentry/*',
                '@netlify/*',
              ],
            },
          ],
        },
      ],
    },
  },
];
