module.exports = {
  env: { es2023: true, node: true },
  parserOptions: { sourceType: 'module' },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-unused-expressions': 'off'
  },
  globals: { fetch: 'readonly' }
};
