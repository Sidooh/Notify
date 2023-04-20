import fs from 'fs';
import path from 'path';
import FileCache from '../FileCache';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const cachePath = path.join(__dirname, 'cache');

describe('FileCache', () => {
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

            FileCache.put(key, initialValue, 1);
            const originalExpirationTime = FileCache.getExpirationTime(key);

            // Wait for 1.5 seconds to ensure cache entry has expired
            await new Promise(resolve => setTimeout(resolve, 1500));

            FileCache.put(key, updatedValue, 1);

            const cachedValue = FileCache.get(key);
            const newExpirationTime = FileCache.getExpirationTime(key);

            expect(cachedValue).toEqual(updatedValue);
            expect(newExpirationTime).toBeGreaterThan(originalExpirationTime);
        });

        it('should set multiple entries in cache', function() {
            const entries = [
                { key: 'key1', value: 'value1', minutes: 1 },
                { key: 'key2', value: 'value2', minutes: 2 },
                { key: 'key3', value: 'value3', minutes: 3 }
            ];

            FileCache.putMany(entries);

            expect(FileCache.get('key1')).toEqual('value1');
            expect(FileCache.get('key2')).toEqual('value2');
            expect(FileCache.get('key3')).toEqual('value3');
        });
    });

    describe('get', () => {
        it('should retrieve cache item if it exists', () => {
            FileCache.put('key', 'value');

            const result = FileCache.get('key');

            expect(result).toBe('value');
        });

        it('should return undefined for non-existent key', function() {
            const value = FileCache.get('nonExistentKey');

            expect(value).toBeUndefined();
        });

        it('should retrieve multiple cache entries', function() {
            const entries = [
                { key: 'key1', value: 'value1', minutes: 1 },
                { key: 'key2', value: 'value2', minutes: 2 },
                { key: 'key3', value: 'value3', minutes: 3 }
            ];

            FileCache.putMany(entries);

            const result = FileCache.getMany<string>(['key1', 'key2', 'key3']);

            expect(result).toEqual({
                'key1': 'value1',
                'key2': 'value2',
                'key3': 'value3'
            });
        });

        it('removes item from cache when it expires', async () => {
            // Set an item to expire after 1 second
            FileCache.add('foo', 'bar', 1);

            // Wait for a while to ensure item is expired
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const result = await FileCache.get('foo');

            expect(result).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should check if cache item exists', () => {
            FileCache.put('key', 'value');

            expect(FileCache.has('key')).toBe(true);
            expect(FileCache.has('non-existent-key')).toBe(false);
        });
    });

    it('should delete cache item', () => {
        FileCache.put('key', 'value');

        expect(FileCache.has('key')).toBe(true);

        FileCache.forget('key');

        expect(FileCache.has('key')).toBe(false);
    });

    it('should flush cache', () => {
        FileCache.put('key1', 'value1');
        FileCache.put('key2', 'value2');

        expect(FileCache.has('key1')).toBe(true);
        expect(FileCache.has('key2')).toBe(true);

        FileCache.flush();

        expect(FileCache.has('key1')).toBe(false);
        expect(FileCache.has('key2')).toBe(false);
    });

    describe('remember', () => {
        it('should remember cache item', async () => {
            const result = await FileCache.remember('key', 60, async () => 'value');

            expect(result).toBe('value');
            expect(FileCache.get('key')).toBe('value');
        });

        it('should store result of async callback in cache', async () => {
            const result = await FileCache.remember('asyncKey', 1, async () => {
                return new Promise<string>((resolve) => {
                    setTimeout(() => {
                        resolve('asyncValue');
                    }, 1000);
                });
            });

            const cachedValue = FileCache.get('asyncKey');
            expect(cachedValue).toEqual(result);
        });
    });

    describe('rememberForever', () => {
        it('should remember forever cache item', async () => {
            const result = await FileCache.rememberForever('key', async () => 'value');

            expect(result).toBe('value');

            // Wait for a while to ensure item is not expired
            await new Promise((resolve) => setTimeout(resolve, 2000));

            expect(FileCache.get('key')).toBe('value');
        });
    });

    describe('increment and decrement', () => {
        beforeEach(() => {
            FileCache.flush();
        });

        describe('increment', () => {
            it('should increment existing value', async () => {
                FileCache.put('counter', 1);

                const result = FileCache.increment('counter');

                expect(result).toBe(2);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(2);
            });

            it('should increment non-existing value', async () => {
                const result = FileCache.increment('counter');

                expect(result).toBe(1);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(1);
            });

            it('should increment with amount', async () => {
                FileCache.put('counter', 1);

                const result = FileCache.increment('counter', 5);

                expect(result).toBe(6);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(6);
            });
        })

        describe('decrement', () => {
            it('should decrement existing value', async () => {
                FileCache.put('counter', 10);

                const result = FileCache.decrement('counter');

                expect(result).toBe(9);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(9);
            });

            it('should decrement non-existing value', async () => {
                const result = FileCache.decrement('counter');

                expect(result).toBe(-1);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(-1);
            });

            it('should decrement with amount', async () => {
                FileCache.put('counter', 10);

                const result = FileCache.decrement('counter', 5);

                expect(result).toBe(5);

                const cachedValue = FileCache.get('counter');

                expect(cachedValue).toEqual(5);
            });
        })
    });

    describe('pull', () => {
        it('should return and removes value if key exists', async () => {
            FileCache.put('foo', 'bar', 60);

            const result = FileCache.pull('foo');

            expect(result).toBe('bar');

            const value = FileCache.get('foo');

            expect(value).toBeUndefined();
        });

        it('should return null if key does not exist', async () => {
            const result = await FileCache.pull('foo');

            expect(result).toBeUndefined();
        });
    })

    describe('deleteCacheDirectoryRecursive', () => {
        it('should delete cache directory and its contents', async () => {
            FileCache.put('foo', 'bar', 60);
            FileCache.put('baz', 'qux', 60);
            FileCache.put('quux', 'corge', 60);

            FileCache.flush();

            const exists = await fs.promises.access('./cache').then(() => true).catch(() => false);

            expect(exists).toBe(false);
        });
    });
});