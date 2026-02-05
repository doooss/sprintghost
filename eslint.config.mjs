import baseConfig from '@repo/eslint-config/base';
import nestjsConfig from '@repo/eslint-config/nestjs';
import nextjsConfig from '@repo/eslint-config/nextjs';

export default [
  // Global ignores
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'],
  },

  // Base config for packages
  ...baseConfig,

  // NestJS config for services/api
  ...nestjsConfig.map((config) => ({
    ...config,
    files: ['services/api/**/*.ts'],
  })),

  // Next.js config for apps/web
  ...nextjsConfig.map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx}'],
  })),
];
