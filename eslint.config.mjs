import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
  // 1. 무시할 폴더 설정
  { ignores: ['dist', 'node_modules', '.next'] },

  // 2. 기본 추천 설정들 (Spread 연산자로 합치기)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. 프로젝트별 상세 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        chrome: 'readonly', // 확장 프로그램 개발을 위한 설정
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
