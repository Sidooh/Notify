import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./tests/env.ts','./tests/setup.ts'],
        include   : ['src/**/*.test.ts']
    }
});