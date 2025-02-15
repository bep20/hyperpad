import globals from 'globals';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  ...compat.extends(
    'plugin:prettier/recommended',
    'airbnb',
    'plugin:react/recommended',
  ),
  {
    languageOptions: { globals: globals.browser, parser: babelParser },
    plugins: {
      prettier: pluginPrettier,
      react: pluginReact,
    },
    rules: {
      eqeqeq: 'off',
      'no-unused-vars': 'error',
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      'linebreak-style': 'off',
      'prettier/prettier': 'off',
      'react/prop-types': 'off',
      'arrow-parens': 'off',
      'implicit-arrow-linebreak': 'off',
      'import/no-named-as-default-member': 'off',
      'react/jsx-closing-bracket-location': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'function-paren-newline': 'off',
      indent: 'off',
      'operator-linebreak': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'jsx-quotes': ['error', 'prefer-single'],
      curly: 'off',
      'nonblock-statement-body-position': 'off',
      'no-restricted-globals': 'off',
      'import/no-webpack-loader-syntax ': 'off',
      'import/no-named-as-default': 'off',
      'react/function-component-definition': 'off',
      'no-confusing-arrow': 'off',
      'object-curly-newline': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-curly-newline': 'off',
      'react/jsx-filename-extension': 'off',
      'import/prefer-default-export': 'off',
      'no-control-regex': 'off',
      camelcase: 'off',
      'no-shadow': 'off',
      'arrow-body-style': 'off',
      'no-plusplus': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react/jsx-wrap-multilines': 'off',
      'react/button-has-type': 'off',
      radix: 'off',
      'max-classes-per-file': 'off',
      'no-nested-ternary': 'off',
    },

    'max-len': 'off',

    files: ['src/**/*.{js,jsx}'],
  },
];
