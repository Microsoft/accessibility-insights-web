module.exports = {
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:security/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 8,
    },
    plugins: ['react', '@typescript-eslint', 'security'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/no-unescaped-entities': 'off',
        'react/jsx-key': 'off',
        'react/no-direct-mutation-state': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-unknown-property': 'off',
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-regexp': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-unsafe-regex': 'off',
        'security/detect-child-process': 'off',
        'security/detect-eval-with-expression': 'off',
        'prefer-const': 'off',
        'no-irregular-whitespace': 'off',
        'no-prototype-builtins': 'off',
        'no-empty': 'off',
        'no-empty-pattern': 'off',
        'no-case-declarations': 'off',
        'no-inner-declarations': 'off',
        'no-useless-escape': 'off',
        'no-var': 'off',
        'no-regex-spaces': 'off',
        'no-extra-boolean-cast': 'off',
        'prefer-spread': 'off',
    },
};
