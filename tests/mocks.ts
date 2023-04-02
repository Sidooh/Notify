import { vi } from 'vitest';

vi.mock('../src/db/prisma');

vi.mock('../src/utils/logger', () => ({
    log: {
        info: vi.fn()
    }
}));
