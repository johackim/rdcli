import globals from 'globals';
import pluginJest from 'eslint-plugin-jest';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules } from '@eslint/compat';

const compat = new FlatCompat({ baseDirectory: process.cwd() });

export default fixupConfigRules([
    ...compat.extends('airbnb-base'),
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            indent: [2, 4, { SwitchCase: 1 }],
            'max-len': [0],
            'no-console': [0],
            'object-curly-newline': [0],
            'import/extensions': [0],
            'import/no-extraneous-dependencies': [0],
            'import/prefer-default-export': [0],
            complexity: [2, 7],
            'max-depth': [2, 2],
        },
    },
    {
        files: ['__tests__/**/*'],
        ...pluginJest.configs['flat/recommended'],
    },
]);
