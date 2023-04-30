import NodeCache from 'node-cache';
import { ICache } from './index';

type CacheValue = any;

interface CacheOptions {
    stdTTL?: number;
    checkperiod?: number;
    useClones?: boolean;
}

class Cache implements ICache {
    private cache: NodeCache;

    constructor(ttlSeconds: number, options: CacheOptions = {}) {
        this.cache = new NodeCache({
            stdTTL     : ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones  : false,
            ...options
        });
    }

    get<V = any>(key: string, defaultValue?: V): V | undefined {
        const value = this.cache.get<V>(key);

        if (value !== undefined) return value;

        return defaultValue;
    }

    getMany<V>(keys: string[]): { [x: string]: V } {
        return this.cache.mget<V>(keys);
    }

    async put(key: string, value: CacheValue, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds === undefined) {
            this.cache.set(key, value);
        } else {
            this.cache.set(key, value, ttlSeconds);
        }
    }

    async putMany(entries: { key: string, value: any, ttl?: number }[]) {
        entries.forEach(e => {
            this.put(e.key, e.value, e.ttl);
        });
    }

    forget(key: string | string[]): void {
        this.cache.del(key);
    }

    async flush(): Promise<void> {
        this.cache.flushAll();
    }

    async remember<V = any>(key: string, ttlSeconds: number, callback: () => Promise<V>): Promise<V> {
        const value = await this.get(key);

        if (value) return value;

        const result = await callback();

        this.cache.set(key, result, ttlSeconds);

        return result;
    }

    async rememberForever(key: string, callback: () => Promise<CacheValue>): Promise<CacheValue> {
        const value = await this.get(key);
        if (value !== null) {
            return value;
        }

        const result = await callback();

        this.cache.set(key, result);

        return result;
    }

    increment(key: string, value: number = 1): number {
        const result = this.get(key, 0);
        const newValue = Number(result) + parseInt(String(value));

        this.put(key, newValue);

        return newValue;
    }

    decrement(key: string, value: number = 1): number {
        const result = this.get(key, 0);
        const newValue = Number(result) - parseInt(String(value));

        this.put(key, newValue);

        return newValue;
    }

    pull<V>(key: string, defaultValue?: V): V | undefined {
        const value = this.get(key, defaultValue);

        this.cache.del(key);

        return value;
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    getTTL<T>(key: string): number | undefined {
        return this.cache.getTtl(key);
    }
}

const MemoryCache = new Cache(60 * 60);
export default MemoryCache;