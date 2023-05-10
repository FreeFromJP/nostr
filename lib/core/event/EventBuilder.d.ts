import { Keys } from '../account/Keys';
import { BaseEvent, EventFinalized } from './Event';
export interface MetaOpts {
    name: string;
    display_name?: string;
    picture?: string;
    banner?: string;
    about?: string;
    website?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
}
export declare function toMetadata(event: BaseEvent, metadata: MetaOpts): Promise<void>;
export declare function toNote(event: BaseEvent, content: string): Promise<void>;
export declare function toReply(event: BaseEvent, referEvent: BaseEvent, content: string): Promise<void>;
export type RelayInfo = {
    [url: string]: {
        read: boolean;
        write: boolean;
    };
};
export type Contacts = [p: string, pubkeyRaw: string, mainRelay?: string, petname?: string][];
export declare function toContact(event: BaseEvent, relays: RelayInfo, contacts: Contacts): Promise<void>;
export declare function toDM(event: BaseEvent, keys: Keys, otherPubkeyRaw: string, plainText: string, opts?: {
    relay?: string;
    replyId?: string;
}): Promise<void>;
export declare function toRepost(event: BaseEvent, orgEvent: EventFinalized): Promise<void>;
export declare function toReaction(event: BaseEvent, orgEvent: EventFinalized, emoji: string): Promise<void>;
export declare function addMentionProfile(event: BaseEvent, insertPosition: number, pubkeyRaw: string, relays?: string[]): Promise<void>;
/**
badge definition example:
        tags: [
            ['d', 'Public Sponsor'],
            ['name', 'Medal of Bravery'],
            ['description', 'Awarded to users demonstrating bravery'],
            ['image', 'https://nostr.academy/awards/bravery.png', '1024x1024'],
            ['thumb', 'https://nostr.academy/awards/bravery_256x256.png', '256x256'],
            ['thumb', 'https://nostr.academy/awards/bravery_128x128.png',  '128x128'],
        ],
 */
export declare function toBadgeDefinition(event: BaseEvent, def: string, //unique name
name: string, //short name,
description: string, image: [string, string, string], thumb: [string, string, string][]): Promise<void>;
