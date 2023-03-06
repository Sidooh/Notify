import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include   : ['src/**/*.test.ts'],
        reporters : ['verbose'],
        setupFiles: ['./tests/env.ts', './tests/mocks.ts', './tests/setup.ts']
    }
});