module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:n8n-nodes-base/nodes',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['n8n-nodes-base'],
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'error',
    'n8n-nodes-base/node-param-default-missing': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-unreachable': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'no-var-requires': 'off',
      },
    },
  ],
};
