import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Prefer `unknown` + narrowing; full removal of `any` is incremental across the repo.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Marketing / syllabus copy uses straight quotes; escaping hurts readability.
      'react/no-unescaped-entities': 'off',
      // Many legitimate Next.js patterns (e.g. sync state to URL) trip these; keep as hints.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // One-off DB / data scripts — not part of the Next app bundle
    'scripts/**',
    'src/scripts/**',
  ]),
]);

export default eslintConfig;
