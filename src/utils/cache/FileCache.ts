import fs from 'fs';
import path from 'path';
import { ICache } from './index';

interface CacheItem<T = any> {
    data: T;
    expiration: number;
}

class Cache implements ICache {
    private cachePath: string;
    private prefix?: string;
    private defaultTtl: number;

    constructor(cachePath: string, prefix?: string, defaultTtl: number = 60) {
        this.cachePath = cachePath;
        this.prefix = prefix;
        this.defaultTtl = defaultTtl;

        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
    }

    get<T>(key: string, defaultValue?: any): T {
        const cacheItem = this.loadCacheItem<T>(key);

        if (!cacheItem) return defaultValue;

        if (cacheItem.expiration !== 0 && cacheItem.expiration < Date.now()) {
            this.forget(key);

            return defaultValue;
        }

        return cacheItem.data;
    }

    getMany<V>(keys: string[]): { [x: string]: V } {
        return keys.reduce((p, c) => ({ ...p, [c]: this.get<V>(c) }), {});
    }

    put(key: string, value: any, ttl: number = this.defaultTtl): void {
        const expiration = ttl === 0 ? 0 : Date.now() + ttl * 1000;
        const cacheItem: CacheItem<any> = {
            data      : value,
            expiration: expiration
        };

        this.saveCacheItem(key, cacheItem);
    }

    putMany(entries: { key: string, value: any, ttl?: number }[]) {
        entries.forEach(e => {
            this.put(e.key, e.value, e.ttl ?? this.defaultTtl);
        });
    }

    forever(key: string, value: any): void {
        this.put(key, value, 0);
    }

    increment(key: string, value: number = 1): number {
        const currentValue = this.get(key, 0);
        const newValue = Number(currentValue) + value;

        this.put(key, newValue);

        return newValue;
    }

    decrement(key: string, value: number = 1): number {
        return this.increment(key, -value);
    }

    pull<V>(key: string, defaultValue?: V): V {
        const value = this.get<V>(key, defaultValue);

        this.forget(key);

        return value;
    }

    forget(keys: string | string[]): void {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }

        keys.forEach(key => {
            const cacheFilePath = this.getCacheFilePath(key);

            if (fs.existsSync(cacheFilePath)) {
                fs.unlinkSync(cacheFilePath);
            }
        });
    }

    flush(): void {
        this.deleteCacheDirectory();
    }

    async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
        const value = this.get<T>(key);

        if (value) return value;

        const result = await callback();

        this.put(key, result, ttl);

        return result;
    }

    async rememberForever<T>(key: string, callback: () => Promise<T>): Promise<T> {
        return await this.remember(key, 0, callback);
    }

    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    getTTL(key: string): number | undefined {
        return this.loadCacheItem(key)?.expiration;
    }

    private loadCacheItem<T>(key: string): CacheItem<T> | undefined {
        const cacheFilePath = this.getCacheFilePath(key);

        if (!fs.existsSync(cacheFilePath)) return undefined;

        const cacheData = fs.readFileSync(cacheFilePath, 'utf8');

        return JSON.parse(cacheData) as CacheItem<T>;
    }

    private saveCacheItem(key: string, cacheItem: CacheItem<any>): void {
        const cacheFilePath = this.getCacheFilePath(key);
        const cacheDirectory = path.dirname(cacheFilePath);

        if (!fs.existsSync(cacheDirectory)) {
            fs.mkdirSync(cacheDirectory, { recursive: true });
        }

        const data = JSON.stringify(cacheItem);

        fs.writeFileSync(cacheFilePath, data, 'utf-8');
    }

    private deleteCacheDirectory(): void {
        if (fs.existsSync(this.cachePath)) {
            const cacheFiles = fs.readdirSync(this.cachePath);

            cacheFiles.forEach((file) => {
                const filePath = path.join(this.cachePath, file);

                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                } else {
                    this.deleteCacheDirectoryRecursive(filePath);
                }
            });

            fs.rmdirSync(this.cachePath);
        }
    }

    private deleteCacheDirectoryRecursive(directoryPath: string): void {
        if (fs.existsSync(directoryPath)) {
            const files = fs.readdirSync(directoryPath);

            files.forEach((file) => {
                const filePath = path.join(directoryPath, file);

                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                } else {
                    this.deleteCacheDirectoryRecursive(filePath);
                }
            });

            fs.rmSync(directoryPath);
        }
    }

    private getCacheFilePath(key: string): string {
        const prefix = this.prefix ? this.prefix + ':' : '';
        const cacheFileName = `${prefix}${key}.cache`;

        return path.join(this.cachePath, cacheFileName);
    }
}

const FileCache = new Cache('storage/cache')
export default FileCache;