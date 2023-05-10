import type { Event } from 'nostr-tools';
import { BaseEvent } from '../core/event/Event';
export default class Channel {
    constructor(opts: {
        name: string;
        about: string;
        picture: string;
        creator: string;
        id?: string;
        relay?: string;
        lastUpdatedAt?: number;
        extra?: {
            [x: string]: any;
        };
    });
    name: string;
    about: string;
    picture: string;
    extra: {
        [x: string]: any;
    };
    id: string;
    relay: string;
    creator: string;
    lastUpdatedAt: number;
    static from(event40: Event, event41s?: Event[]): Channel;
    static parseContent(content: string): any;
    toUnsignedEvent(): BaseEvent;
}
