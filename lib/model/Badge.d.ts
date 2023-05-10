import { TagValue } from 'src/core/utils/Misc';
import { BaseEvent, EventFinalized } from '../core/event/Event';
/**
 * Badge Image & Thumb, URL and dimension
 */
export declare class BadgeImage {
    url: string;
    width?: number;
    height?: number;
    constructor(url: string, width?: number, height?: number);
    static RegexImageDimension: RegExp;
    /**
     * parse from `TagValue`
     * @param tagValue note: without the leading tag name
     * @returns BadgeImage on success, otherwise undefined
     */
    static fromTagValue(tagValue: TagValue): BadgeImage | undefined;
    /**
     * convert url & w/h to string array according to NIP-58
     * @returns to `TagValue` (`string[]`), only the slice after the tag name
     */
    toTagValue(): TagValue;
}
export interface BadgeDefinitionOptionalFields {
    name?: string;
    description?: string;
    image?: BadgeImage;
    thumbList?: BadgeImage[];
}
export declare class BadgeDefinition {
    id: string;
    name?: string;
    description?: string;
    highResImage?: BadgeImage;
    thumbList: BadgeImage[];
    static TagRequiredUniqueName: string;
    static TagOptionalShortName: string;
    static TagOptionalImage: string;
    static TagOptionalDescription: string;
    static TagOptionalThumb: string;
    constructor(id: string, options?: BadgeDefinitionOptionalFields);
    /**
     * parse a badge definition strictly follow the NIP-58
     * @param event nostr event
     * @returns BadgeDefinition if input event confirm spec, otherwise undefined
     */
    static from(event: EventFinalized): BadgeDefinition | undefined;
    toUnsignedEvent(): BaseEvent;
}
