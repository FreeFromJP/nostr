export declare class SortedArray<T> {
    protected data: T[];
    private compare;
    constructor(compareFn: (a: T, b: T) => number);
    insert(value: T): void;
    remove(value: T): void;
    get(index: number): T | undefined;
    size(): number;
    findAllIndexes(value: T): number[];
    private binarySearch;
}
export declare class SortedSet<T> extends SortedArray<T> {
    private hash;
    private hashSet;
    constructor(compareFn: (a: T, b: T) => number, hash: (a: T) => string);
    insert(value: T): void;
    remove(value: T): void;
    has(value: T): boolean;
    getIndexOf(value: T): number;
}
interface Timestamped {
    created_at: number;
}
export declare function sortDesc(events: Timestamped[]): Timestamped[];
export declare function sortAsc(events: Timestamped[]): Timestamped[];
export {};
