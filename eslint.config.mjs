import antfu from '@antfu/eslint-config';

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(antfu({
  type: 'app',
  vue: true,
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: 'single',
  },
  ignores: ['.pnpm-store/**', '**/migrations/*'],
}, {
  rules: {
    // 'vue/max-attributes-per-line': ['error', {
    //   singleline: {
    //     max: 2,
    //   },
    //   multiline: {
    //     max: 1,
    //   },
    // }],
    'style/brace-style': ['warn', '1tbs'],
    // 'ts/no-redeclare': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
    'no-console': ['warn'],
    'antfu/if-newline': 'off',
    'antfu/no-top-level-await': ['off'],
    'node/prefer-global/process': ['off'],
    'node/no-process-env': ['warn'],
    'perfectionist/sort-imports': ['error', {
      tsconfigRootDir: '.',
    }],
    // 'unicorn/filename-case': ['error', {
    //   case: 'kebabCase',
    //   ignore: ['README.md'],
    // }],
  },
},
// {
//   files: ['app/components/**/*.vue'],
//   rules: {
//     'unicorn/filename-case': ['error', { case: 'pascalCase' }],
//   },
// },
{
  files: ['src/**/*.ts'],
  rules: {
    'no-console': 'off',
    'node/no-process-env': 'off',
  },
}));
