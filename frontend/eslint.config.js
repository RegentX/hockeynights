import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'public/mockServiceWorker.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      boundaries,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
      'boundaries/elements': [
        {type: 'app', pattern: 'src/app'},
        {type: 'pages', pattern: 'src/pages/*', capture: ['pageName']},
        {type: 'widgets', pattern: 'src/widgets/*', capture: ['widgetName']},
        {type: 'features', pattern: 'src/features/*', capture: ['featureName']},
        {type: 'entities', pattern: 'src/entities/*', capture: ['entityName']},
        {type: 'shared', pattern: 'src/shared'},
        {type: 'mocks', pattern: 'src/mocks'},
        {type: 'test', pattern: 'src/test'},
      ],
      'boundaries/files': [{pattern: 'src/main.tsx', category: 'bootstrap'}],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.spec.tsx'],
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          assert: 'either',
          controlComponents: ['Switch'],
          depth: 3,
        },
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: {file: {categories: ['bootstrap']}},
              allow: {element: {types: ['app', 'mocks', 'shared']}},
            },
            {
              from: {element: {type: 'app'}},
              allow: {
                element: {types: ['pages', 'widgets', 'features', 'entities', 'shared', 'app']},
              },
            },
            {
              from: {element: {type: 'pages'}},
              allow: {element: {types: ['widgets', 'features', 'entities', 'shared', 'pages']}},
            },
            {
              from: {element: {type: 'widgets'}},
              allow: {element: {types: ['features', 'entities', 'shared', 'widgets']}},
            },
            {
              from: {element: {type: 'features'}},
              allow: {
                element: {
                  types: ['entities', 'shared', 'features'],
                },
              },
            },
            {
              from: {element: {type: 'entities'}},
              allow: {element: {types: ['shared', 'entities']}},
            },
            {
              from: {element: {type: 'shared'}},
              allow: {element: {type: 'shared'}},
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*', 'src/widgets/**/*'],
    ignores: ['src/**/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*', '@/features/*/*/*'],
              message:
                'Import from the feature public API (@/features/<name>) instead of deep paths.',
            },
            {
              group: ['@/pages/*/ui/*', '@/pages/*/ui/*/*'],
              message:
                'Import from the page slice public API (@/pages/<name>) instead of deep paths.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/test/**/*', 'src/shared/theme/HockeyThemeProvider.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'boundaries/dependencies': 'off',
    },
  },
  {
    files: ['src/mocks/**/*'],
    rules: {
      'boundaries/dependencies': 'off',
    },
  },
  eslintConfigPrettier,
])
