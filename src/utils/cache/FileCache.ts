import fs from 'fs';
import path from 'path';

interface CacheItem {
    data: any;
    expiration: number;
}

class Cache {
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

    get(cacheKey: string, defaultValue?: any): any {
        const cacheItem = this.loadCacheItem(cacheKey);

        if (!cacheItem) return defaultValue;

        if (cacheItem.expiration !== 0 && cacheItem.expiration < Date.now()) {
            this.forget(cacheKey);

            return defaultValue;
        }

        return cacheItem.data;
    }

    put(cacheKey: string, value: any, ttl: number = this.defaultTtl): void {
        const expiration = ttl === 0 ? 0 : Date.now() + ttl * 1000;
        const cacheItem: CacheItem = {
            data      : value,
            expiration: expiration
        };
        this.saveCacheItem(cacheKey, cacheItem);
    }

    add(cacheKey: string, value: any, ttl: number = this.defaultTtl): boolean {
        if (this.has(cacheKey)) {
            return false;
        }
        this.put(cacheKey, value, ttl);
        return true;
    }

    forever(cacheKey: string, value: any): void {
        this.put(cacheKey, value, 0);
    }

    increment(cacheKey: string, value: number = 1): number {
        const currentValue = this.get(cacheKey, 0);
        const newValue = Number(currentValue) + value;
        this.put(cacheKey, newValue);
        return newValue;
    }

    decrement(cacheKey: string, value: number = 1): number {
        return this.increment(cacheKey, -value);
    }

    pull(cacheKey: string, defaultValue?: any): any {
        const value = this.get(cacheKey, defaultValue);

        this.forget(cacheKey);

        return value;
    }

    forget(cacheKey: string): boolean {
        const cacheFilePath = this.getCacheFilePath(cacheKey);

        if (fs.existsSync(cacheFilePath)) {
            fs.unlinkSync(cacheFilePath);

            return true;
        }

        return false;
    }

    flush(): void {
        this.deleteCacheDirectory();
    }

    remember(cacheKey: string, ttl: number, callback: Function): any {
        const value = this.get(cacheKey);

        if (value !== undefined) return value;

        const newValue = callback();

        this.put(cacheKey, newValue, ttl);

        return newValue;
    }

    rememberForever(cacheKey: string, callback: Function): any {
        return this.remember(cacheKey, 0, callback);
    }

    has(cacheKey: string): boolean {
        return this.get(cacheKey) !== undefined;
    }

    private loadCacheItem(cacheKey: string): CacheItem | null {
        const cacheFilePath = this.getCacheFilePath(cacheKey);

        if (!fs.existsSync(cacheFilePath)) return null;

        const cacheData = fs.readFileSync(cacheFilePath, 'utf8');

        return JSON.parse(cacheData) as CacheItem;
    }

    private saveCacheItem(cacheKey: string, cacheItem: CacheItem): void {
        const cacheFilePath = this.getCacheFilePath(cacheKey);
        const cacheDirectory = path.dirname(cacheFilePath);

        if (!fs.existsSync(cacheDirectory)) {
            fs.mkdirSync(cacheDirectory, { recursive: true });
        }

        const data = JSON.stringify(cacheItem);

        fs.writeFileSync(cacheFilePath, data, 'utf-8');
    }

    private deleteCacheFile(cacheKey: string): void {
        const cacheFilePath = this.getCacheFilePath(cacheKey);

        if (fs.existsSync(cacheFilePath)) {
            fs.unlinkSync(cacheFilePath);
        }
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

            fs.rmdirSync(directoryPath);
        }
    }

    private getCacheFilePath(cacheKey: string): string {
        const prefix = this.prefix ? this.prefix + ':' : '';
        const cacheFileName = `${prefix}${cacheKey}.cache`;

        return path.join(this.cachePath, cacheFileName);
    }
}

const FileCache = new Cache('storage/cache');
export default FileCache;