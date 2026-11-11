module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['unused-imports', '@typescript-eslint'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
    ],
    '@typescript-eslint/no-unused-vars': 'off'
  }
};
