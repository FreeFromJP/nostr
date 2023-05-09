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
    CHATROOM: number;
    BDADE_REWARD: number;
    BADGE_DEFINATION: number;
};
export type Tag = string[];
export type Tags = Tag[];
export interface mod {
    (eventObj: BaseEvent, ...opts: any): Promise<void>;
}
export declare class BaseEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: Tags;
    content: string;
    sig: string;
    constructor(event?: Event);
    get author(): string;
    hash(): void;
    modify(modFn: mod, ...opts: any): Promise<this>;
    signByKey(keys: Keys): void;
    finalized(): Event;
}
