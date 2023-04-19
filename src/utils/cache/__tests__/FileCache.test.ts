import fs from 'fs';
import path from 'path';
import FileCache from '../FileCache';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const cachePath = path.join(__dirname, 'cache');

beforeAll(() => {
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath);
    }
});

afterAll(() => {
    if (fs.existsSync(cachePath)) {
        fs.rmdirSync(cachePath, { recursive: true });
    }
});

describe('FileCache', () => {
    it('should set and get cache item', () => {
        FileCache.put('key', 'value');

        const result = FileCache.get('key');

        expect(result).toBe('value');
    });

    it('should check if cache item exists', () => {
        FileCache.put('key', 'value');

        expect(FileCache.has('key')).toBe(true);
        expect(FileCache.has('non-existent-key')).toBe(false);
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

    it('should remember cache item', async () => {
        const result = await FileCache.remember('key', 60, async () => 'value');

        expect(result).toBe('value');
        expect(FileCache.get('key')).toBe('value');
    });

    it('should remember forever cache item', async () => {
        const result = await FileCache.rememberForever('key', async () => 'value');

        expect(result).toBe('value');
        expect(FileCache.get('key')).toBe('value');
    });
});