import { nip19, nip27 } from 'nostr-tools'
import type { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19'
import { filter, includes, map, tail } from 'ramda'

import TextExtraction from './TextExtraction'

/**
 * return `now()` in unit *seconds*, and use `floor` to round down to an integer
 * @returns current timestamp in seconds
 */
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

export function classifyURL(url: string): 'image' | 'video' | 'audio' | 'link' {
    const extension = url.split('.').pop()?.toLowerCase()

    if (!extension) {
        return 'link'
    }

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    // 'm4v', 'm4p', 'm4b', 'm4r', '3gp'
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
    // 'opus', 'wma', 'aiff', 'alac'
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac']

    if (imageExtensions.includes(extension)) {
        return 'image'
    } else if (videoExtensions.includes(extension)) {
        return 'video'
    } else if (audioExtensions.includes(extension)) {
        return 'audio'
    } else {
        return 'link'
    }
}

export const HTTP_URL_REGEX =
    /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/i
export const NOSTR_URI_REGEX = nip27.regex()

export type ParseContentItem =
    | { type: 'nprofile'; content: string; data: ProfilePointer }
    | { type: 'nrelay'; content: string; data: string }
    | { type: 'nevent'; content: string; data: EventPointer }
    | { type: 'naddr'; content: string; data: AddressPointer }
    | { type: 'nsec'; content: string; data: string }
    | { type: 'npub'; content: string; data: string }
    | { type: 'note'; content: string; data: string }
    | { type: 'image'; content: string; url: string }
    | { type: 'link'; content: string; url: string }
    | { type: 'video'; content: string; url: string }
    | { type: 'audio'; content: string; url: string }
    | { type: 'text'; content: string }

export function parseContent(
    content = '',
    opts = {
        httpUrl: true,
        nostrUri: true,
    },
): ParseContentItem[] {
    const patterns = []
    if (opts.httpUrl) {
        patterns.push({
            pattern: HTTP_URL_REGEX,
            renderText: (text: string, m: string[]) => {
                const type = classifyURL(text)
                const href = text.startsWith('http') ? text : `https://${text}`

                return {
                    type: type,
                    url: href,
                    content: text,
                }
            },
        })
    }
    if (opts.nostrUri) {
        patterns.push({
            pattern: NOSTR_URI_REGEX,
            renderText: (text: string, m: string[]) => {
                const nip19Result = nip19.decode(m[1])
                return {
                    ...nip19Result,
                    content: m[0],
                }
            },
        })
    }

    const textExtraction = new TextExtraction(content, patterns)

    const result = textExtraction.parse().map((el) => {
        // @ts-ignore
        const data = el.children

        if (typeof data === 'string') {
            return {
                type: 'text',
                content: data,
            } as ParseContentItem
        }
        return data as ParseContentItem
    })

    return result
}
