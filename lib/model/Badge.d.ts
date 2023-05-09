import { EventFinalized } from '../core/event/Event';
interface BadgeImageInfo {
    url: string;
    width?: number;
    height?: number;
}
interface BadgeDefinitionInitOptions {
    name?: string;
    description?: string;
    highResImage?: BadgeImageInfo;
    thumbList: BadgeImageInfo[];
}
export declare class BadgeDefinition {
    id: string;
    name?: string;
    description?: string;
    highResImage?: BadgeImageInfo;
    thumbList: BadgeImageInfo[];
    static TagRequiredUniqueName: string;
    static TagOptionalShortName: string;
    static TagOptionalImage: string;
    static TagOptionalDescription: string;
    static TagOptionalThumb: string;
    constructor(id: string, options?: BadgeDefinitionInitOptions);
    /**
     * parse a badge definition strictly follow the NIP-58
     * @param event nostr event
     * @returns BadgeDefinition if input event confirm spec, otherwise undefined
     */
    static fromEvent(event: EventFinalized): BadgeDefinition | undefined;
}
export {};
