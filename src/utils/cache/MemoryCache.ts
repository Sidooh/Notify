import NodeCache from 'node-cache';

type CacheValue = any;

interface CacheOptions {
    stdTTL?: number;
    checkperiod?: number;
    useClones?: boolean;
}

class Cache {
    private cache: NodeCache;

    constructor(ttlSeconds: number, options: CacheOptions = {}) {
        this.cache = new NodeCache({
            stdTTL     : ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones  : false,
            ...options
        });
    }

    async get<V = any>(key: string, defaultValue: CacheValue = null): Promise<V> {
        const value = this.cache.get<V>(key);

        if (value !== undefined) return value;

        if (typeof defaultValue === 'function') {
            const result = await defaultValue();

            this.cache.set(key, result);

            return result;
        }

        return defaultValue;
    }

    async put(key: string, value: CacheValue, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds === undefined) {
            this.cache.set(key, value);
        } else {
            this.cache.set(key, value, ttlSeconds);
        }
    }

    async forget(key: string): Promise<void> {
        this.cache.del(key);
    }

    async flush(): Promise<void> {
        this.cache.flushAll();
    }

    async remember<V = any>(key: string, ttlSeconds: number, callback: () => Promise<V>): Promise<V> {
        const value = await this.get(key);

        if (value !== null) return value;

        const result = await callback();

        await this.put(key, result, ttlSeconds);

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

    async increment(key: string, value: number = 1): Promise<number> {
        const result = await this.get(key, 0);
        const newValue = parseInt(result) + parseInt(String(value));

        await this.put(key, newValue);

        return newValue;
    }

    async decrement(key: string, value: number = 1): Promise<number> {
        const result = await this.get(key, 0);
        const newValue = parseInt(result) - parseInt(String(value));

        await this.put(key, newValue);

        return newValue;
    }

    async pull(key: string, defaultValue: CacheValue = null): Promise<CacheValue> {
        const value = await this.get(key, defaultValue);

        await this.forget(key);

        return value;
    }
}

const MemoryCache = new Cache(60 * 60);
export default MemoryCache;