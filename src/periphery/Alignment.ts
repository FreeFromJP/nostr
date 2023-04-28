export class SortedSet<T> extends SortedArray<T> {
    private hash: (a: T) => string
    private hashSet: Set<string>

    constructor(compareFn: (a: T, b: T) => number, hash: (a: T) => string) {
        super(compareFn)
        this.hash = hash
        this.hashSet = new Set<string>()
    }

    insert(value: T): void {
        const id = this.hash(value)
        if (!this.hashSet.has(id)) {
            super.insert(value)
            this.hashSet.add(id)
        }
    }

    remove(value: T): void {
        const id = this.hash(value)
        super.remove(value)
        this.hashSet.delete(id)
    }

    has(value: T): boolean {
        return this.hashSet.has(this.hash(value))
    }

    getIndexOf(value: T): number {
        const id = this.hash(value)
        const indexes = this.findAllIndexes(value)
        for (const index of indexes) {
            if (this.hash(this.get(index) as T) == id) return index
        }
        return -1
    }
}

export class SortedArray<T> {
    private data: T[]
    private compare: (a: T, b: T) => number

    constructor(compareFn: (a: T, b: T) => number) {
        this.data = []
        this.compare = compareFn
    }

    insert(value: T): void {
        if (this.data.length === 0) {
            this.data.push(value)
            return
        }

        let index = this.binarySearch(value)
        if (this.compare(this.data[index], value) < 0) {
            index++
        }
        this.data.splice(index, 0, value)
    }

    remove(value: T): void {
        const index = this.binarySearch(value)
        if (this.compare(this.data[index], value) === 0) {
            this.data.splice(index, 1)
        }
    }

    get(index: number): T | undefined {
        return this.data[index]
    }

    size(): number {
        return this.data.length
    }

    findAllIndexes(value: T): number[] {
        const index = this.binarySearch(value)
        if (this.compare(this.data[index], value) !== 0) {
            return []
        }

        const result: number[] = []
        let leftIndex = index - 1
        let rightIndex = index

        while (rightIndex < this.data.length && this.compare(this.data[rightIndex], value) === 0) {
            result.push(rightIndex)
            rightIndex++
        }

        while (leftIndex >= 0 && this.compare(this.data[leftIndex], value) === 0) {
            result.unshift(leftIndex)
            leftIndex--
        }

        return result
    }

    private binarySearch(value: T): number {
        let left = 0
        let right = this.data.length - 1

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)

            if (this.compare(this.data[mid], value) === 0) {
                return mid
            }

            if (this.compare(this.data[mid], value) < 0) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }

        return left
    }
}
