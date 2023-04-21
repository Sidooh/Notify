import fs from 'fs';
import path from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import MemoryCache from '../MemoryCache';

const cachePath = path.join(__dirname, 'cache');

describe('MemoryCache', () => {
    beforeAll(() => {
        if (!fs.existsSync(cachePath)) {
            fs.mkdirSync(cachePath);
        }
    });

    afterAll(() => {
        if (fs.existsSync(cachePath)) {
            fs.rmSync(cachePath, { recursive: true });
        }
    });

    describe('put', () => {
        it('should update existing cache entry', async function() {
            const key = 'existingKey';
            const initialValue = 'initialValue';
            const updatedValue = 'updatedValue';

            MemoryCache.put(key, initialValue, 1);

            const originalExpirationTime = MemoryCache.getTTL(key);

            // Wait for 1.5 seconds to ensure cache entry has expired
            await new Promise(resolve => setTimeout(resolve, 1500));

            MemoryCache.put(key, updatedValue, 1);

            const cachedValue = MemoryCache.get(key);
            const newExpirationTime = MemoryCache.getTTL(key);

            expect(cachedValue).toEqual(updatedValue);
            expect(newExpirationTime).toBeDefined();
            expect(originalExpirationTime).toBeDefined();
            expect(newExpirationTime).toBeGreaterThan(originalExpirationTime!);
        });

        it('should set multiple entries in cache', function() {
            const entries = [
                { key: 'key1', value: 'value1', minutes: 1 },
                { key: 'key2', value: 'value2', minutes: 2 },
                { key: 'key3', value: 'value3', minutes: 3 }
            ];

            MemoryCache.putMany(entries);

            expect(MemoryCache.get('key1')).toEqual('value1');
            expect(MemoryCache.get('key2')).toEqual('value2');
            expect(MemoryCache.get('key3')).toEqual('value3');
        });
    });

    describe('get', () => {
        it('should retrieve cache item if it exists', () => {
            MemoryCache.put('key', 'value');

            const result = MemoryCache.get('key');

            expect(result).toBe('value');
        });

        it('should return undefined for non-existent key', function() {
            const value = MemoryCache.get('nonExistentKey');

            expect(value).toBeUndefined();
        });

        it('should retrieve multiple cache entries', function() {
            const entries = [
                { key: 'key1', value: 'value1', minutes: 1 },
                { key: 'key2', value: 'value2', minutes: 2 },
                { key: 'key3', value: 'value3', minutes: 3 }
            ];

            MemoryCache.putMany(entries);

            const result = MemoryCache.getMany<string>(['key1', 'key2', 'key3']);

            expect(result).toEqual({
                'key1': 'value1',
                'key2': 'value2',
                'key3': 'value3'
            });
        });

        it('removes item from cache when it expires', async () => {
            // Set an item to expire after 1 second
            MemoryCache.put('foo', 'bar', 1);

            // Wait for a while to ensure item is expired
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const result = await MemoryCache.get('foo');

            expect(result).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should check if cache item exists', () => {
            MemoryCache.put('key', 'value');

            expect(MemoryCache.has('key')).toBe(true);
            expect(MemoryCache.has('non-existent-key')).toBe(false);
        });
    });

    it('should delete cache item', () => {
        MemoryCache.put('key', 'value');

        expect(MemoryCache.has('key')).toBe(true);

        MemoryCache.forget('key');

        expect(MemoryCache.has('key')).toBe(false);
    });

    it('should flush cache', () => {
        MemoryCache.put('key1', 'value1');
        MemoryCache.put('key2', 'value2');

        expect(MemoryCache.has('key1')).toBe(true);
        expect(MemoryCache.has('key2')).toBe(true);

        MemoryCache.flush();

        expect(MemoryCache.has('key1')).toBe(false);
        expect(MemoryCache.has('key2')).toBe(false);
    });

    describe('remember', () => {
        it('should remember cache item', async () => {
            const result = await MemoryCache.remember('key', 60, async () => 'value');

            expect(result).toBe('value');
            expect(MemoryCache.get('key')).toBe('value');
        });

        it('should store result of async callback in cache', async () => {
            const result = await MemoryCache.remember('asyncKey', 1, async () => {
                return new Promise<string>((resolve) => {
                    setTimeout(() => {
                        resolve('asyncValue');
                    }, 1000);
                });
            });

            const cachedValue = MemoryCache.get('asyncKey');
            expect(cachedValue).toEqual(result);
        });
    });

    describe('rememberForever', () => {
        it('should remember forever cache item', async () => {
            const result = await MemoryCache.rememberForever('key', async () => 'value');

            expect(result).toBe('value');

            // Wait for a while to ensure item is not expired
            await new Promise((resolve) => setTimeout(resolve, 2000));

            expect(MemoryCache.get('key')).toBe('value');
        });
    });

    describe('increment and decrement', () => {
        beforeEach(() => {
            MemoryCache.flush();
        });

        describe('increment', () => {
            it('should increment existing value', async () => {
                MemoryCache.put('counter', 1);

                const result = MemoryCache.increment('counter');

                expect(result).toBe(2);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(2);
            });

            it('should increment non-existing value', async () => {
                const result = MemoryCache.increment('counter');

                expect(result).toBe(1);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(1);
            });

            it('should increment with amount', async () => {
                MemoryCache.put('counter', 1);

                const result = MemoryCache.increment('counter', 5);

                expect(result).toBe(6);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(6);
            });
        });

        describe('decrement', () => {
            it('should decrement existing value', async () => {
                MemoryCache.put('counter', 10);

                const result = MemoryCache.decrement('counter');

                expect(result).toBe(9);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(9);
            });

            it('should decrement non-existing value', async () => {
                const result = MemoryCache.decrement('counter');

                expect(result).toBe(-1);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(-1);
            });

            it('should decrement with amount', async () => {
                MemoryCache.put('counter', 10);

                const result = MemoryCache.decrement('counter', 5);

                expect(result).toBe(5);

                const cachedValue = MemoryCache.get('counter');

                expect(cachedValue).toEqual(5);
            });
        });
    });

    describe('pull', () => {
        it('should return and removes value if key exists', async () => {
            MemoryCache.put('foo', 'bar', 60);

            const result = MemoryCache.pull('foo');

            expect(result).toBe('bar');

            const value = MemoryCache.get('foo');

            expect(value).toBeUndefined();
        });

        it('should return null if key does not exist', async () => {
            const result = await MemoryCache.pull('foo');

            expect(result).toBeUndefined();
        });
    });

    describe('deleteCacheDirectoryRecursive', () => {
        it('should delete cache directory and its contents', async () => {
            MemoryCache.put('foo', 'bar', 60);
            MemoryCache.put('baz', 'qux', 60);
            MemoryCache.put('quux', 'corge', 60);

            MemoryCache.flush();

            const exists = await fs.promises.access('./cache').then(() => true).catch(() => false);

            expect(exists).toBe(false);
        });
    });
});