module.exports = {
root: true,
env: { es2023: true, node: true },
parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
extends: [],
rules: {
'no-tabs': 'error',
'quotes': ['error', 'single', { 'avoidEscape': true }],
'no-trailing-spaces': 'error',
'eol-last': ['error', 'always']
},
ignorePatterns: ['summary/**', 'docs/**']
};