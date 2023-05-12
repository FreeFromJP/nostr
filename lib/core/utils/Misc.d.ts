import type { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
/**
 * return `now()` in unit *seconds*, and use `floor` to round down to an integer
 * @returns current timestamp in seconds
 */
export declare function now(): number;
export type TagValue = readonly string[];
export declare function getOptionalTagValueByName<T extends readonly string[]>(eventTags: readonly string[][], ...tagNameList: T): {
    [K in keyof T]: TagValue[];
};
export declare function getTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[] | undefined;
export declare function getRequiredTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[];
export declare function getRequiredFirstTagValue(eventTags: readonly string[][], tagName: string): string;
export declare function classifyURL(url: string): 'image' | 'video' | 'audio' | 'link';
export declare const HTTP_URL_REGEX: RegExp;
export declare const NOSTR_URI_REGEX: RegExp;
export type ParseContentItem = {
    type: 'nprofile';
    content: string;
    data: ProfilePointer;
} | {
    type: 'nrelay';
    content: string;
    data: string;
} | {
    type: 'nevent';
    content: string;
    data: EventPointer;
} | {
    type: 'naddr';
    content: string;
    data: AddressPointer;
} | {
    type: 'nsec';
    content: string;
    data: string;
} | {
    type: 'npub';
    content: string;
    data: string;
} | {
    type: 'note';
    content: string;
    data: string;
} | {
    type: 'image';
    content: string;
    url: string;
} | {
    type: 'link';
    content: string;
    url: string;
} | {
    type: 'video';
    content: string;
    url: string;
} | {
    type: 'audio';
    content: string;
    url: string;
} | {
    type: 'text';
    content: string;
};
export declare function parseContent(content?: string, opts?: {
    httpUrl: boolean;
    nostrUri: boolean;
}): ParseContentItem[];
