import { filter, includes, map, tail } from 'ramda'

// return `now()` in unit *seconds*, and use `floor` to round down to an integer
export function now() {
    return Math.floor(Date.now() / 1000)
}

export type TagValue = readonly string[]

export function getOptionalTagValueByName<T extends readonly string[]>(
    eventTags: readonly string[][],
    ...tagNameList: T
): { [K in keyof T]: TagValue[] } {
    const allTargetTags = eventTags.filter((tags) => includes(tags[0], tagNameList))
    return tagNameList.map((tagName) => {
        return map(
            tail,
            filter((t) => t[0] === tagName, allTargetTags),
        )
    }) as { [K in keyof T]: TagValue[] }
}

// TODO dvd 5-8 move to a better location and in a better code structure
export function getTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[] | undefined {
    if (eventTags.length === 0) {
        return undefined
    }
    const targetTagList = map(
        tail,
        filter((t) => Array.isArray(t) && t[0] === tagName, eventTags),
    )
    return targetTagList
}

// get all tag values by name, expecting target tag having at least once,
// or else will throw an error
// tag name (aka the first element in the tags array) is already removed
export function getRequiredTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[] {
    const r = getTagValueByName(eventTags, tagName)
    if (r === undefined) {
        throw new Error(`[params error] get required tag ${tagName} failed`)
    }
    if (r.length === 0) {
        throw new Error(`[params error] tag ${tagName} not found in taglist`)
    }
    return r
}

// note: performance improvement: use only one traverse to retreive all request fields
export function getRequiredFirstTagValue(eventTags: readonly string[][], tagName: string): string {
    const r = getRequiredTagValueByName(eventTags, tagName)
    const firstTagValue = r[0]
    if (firstTagValue.length === 0) {
        throw new Error(`expecting at least one tag value after tag name`)
    }
    return firstTagValue[0]
}
