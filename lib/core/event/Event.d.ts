import { Event } from 'nostr-tools';
import { Keys } from '../account/Keys';
export { Event as EventFinalized };
export declare const KnownEventKind: {
    METADATA: number;
    NOTE: number;
    RELAY: number;
    CONTACT: number;
    DM: number;
    DELETE: number;
    REPOST: number;
    REACTION: number;
    BADGE_PROFILE: number;
    BDADE_REWARD: number;
    BADGE_DEFINATION: number;
    CHANNEL_CREATION: number;
    CHANNEL_METADATA: number;
    CHANNEL_MESSAGE: number;
    REPORTING: number;
};
export type Tag = string[];
export type Tags = Tag[];
export interface mod {
    (eventObj: BaseEvent, ...opts: any): Promise<void>;
}
/**
 * this can be used to build new event or receive incoming event
 */
export declare class BaseEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: Tags;
    content: string;
    sig: string;
    /**
     * create a new empty `BaseEvent` when argument is undefined,
     * create `BaseEvent` from existing `Event` json object when argument not null.
     * throw `Error` if argument is invalid, e.g.: signature invalid
     * @param event optional `nostr-tools` event object
     */
    constructor(event?: Event);
    get author(): string;
    hash(): void;
    modify(modFn: mod, ...opts: any): Promise<this>;
    signByKey(keys: Keys): void;
    finalized(): Event;
}
