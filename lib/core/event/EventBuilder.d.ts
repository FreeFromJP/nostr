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
export type relayInfo = {
    [url: string]: {
        read: boolean;
        write: boolean;
    };
};
export type contacts = [p: string, pubkeyRaw: string, mainRelay?: string, petname?: string][];
export declare function toContact(event: BaseEvent, relays: relayInfo, contacts: contacts): Promise<void>;
export declare function toDM(event: BaseEvent, keys: Keys, otherPubkeyRaw: string, plainText: string, opts?: {
    relay?: string;
    replyId?: string;
}): Promise<void>;
export declare function toRepost(event: BaseEvent, orgEvent: EventFinalized): Promise<void>;
export declare function toReaction(event: BaseEvent, orgEvent: EventFinalized, emoji: string): Promise<void>;
export declare function addMentionProfile(event: BaseEvent, insertPosition: number, pubkeyRaw: string, relays?: string[]): Promise<void>;
