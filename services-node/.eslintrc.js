module.exports = {
    parser: 'babel-eslint',
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
        jest: true,
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
    },
    rules: {
        'no-console': 0,
        'no-const-assign': 'warn',
        'no-this-before-super': 'warn',
        'no-undef': 'warn',
        'no-unreachable': 'warn',
        'no-unused-vars': 'warn',
        'constructor-super': 'warn',
        'valid-typeof': 'warn',
        'function-paren-newline': ['error', 'never'],
        'header/header': [2, 'line', { pattern: 'Copyright Nuvoloso.com, \\d{4}$' }],
        eqeqeq: ['error', 'always'],
    },
    extends: ['eslint:recommended'],
    plugins: ['header'],
};
