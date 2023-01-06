module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:nuxt/recommended'
  ],
  env: {
    browser: true,
    es2016: true,
    node: true
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    eqeqeq: 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'max-len': ['error', { code: 89 }],
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 0,
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    'no-tabs': ['error', { allowIndentationTabs: false }],
    'one-var': ['error', 'never'],
    'no-undefined': 'error',
    'dot-notation': 'error',
    'no-unused-vars': 'error',
    'no-delete-var': 'error',
    'no-var': 'error'
  }
};
