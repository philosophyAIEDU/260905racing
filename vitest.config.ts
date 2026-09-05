import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: {
    alias: {
      '@drivetalk/game-core': fileURLToPath(
        new URL('./packages/game-core/src/index.ts', import.meta.url),
      ),
      '@drivetalk/schema': fileURLToPath(
        new URL('./packages/schema/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['packages/game-core/src/**', 'packages/schema/src/**'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
