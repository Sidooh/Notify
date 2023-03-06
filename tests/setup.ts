// import { mockReset } from 'jest-mock-extended';
// import { prismaMock } from './mocks';

import { vi } from 'vitest';

vi.mock('../src/db/prisma');

/*beforeAll(async () => {
    console.error = jest.fn().mockImplementation(() => {});
    console.info = jest.fn().mockImplementation(() => {});
    console.log = jest.fn().mockImplementation(() => {});
});

beforeEach(() => {
    mockReset(prismaMock)
})*/

// afterAll(async () => await dataSource.destroy());

// jest.setTimeout(10000);
