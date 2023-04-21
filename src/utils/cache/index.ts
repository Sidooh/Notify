export interface ICache {
    get(key: string, defaultValue?: any): Promise<any>;

    put(key: string, value: any, ttl?: number): void;

    putMany(entries: { key: string, value: any, ttl?: number }[]): void;

    remember<V>(key: string, ttl: number, callback: () => Promise<V>): Promise<V>;

    rememberForever<T>(key: string, callback: () => Promise<T>): Promise<T>;

    increment(key: string, value?: number): number;

    decrement(key: string, value?: number): number;

    has(key: string): boolean;

    pull<V>(key: string, defaultValue?: V): V | undefined;

    forget(key: string | string[]): void;

    flush(): void;

    getMany<V>(keys: string[]): { [x: string]: V };

    getTTL(key: string): number | undefined;
}

export default Cache;