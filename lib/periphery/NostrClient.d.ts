import type { Event, Filter, Sub, SubscriptionOptions } from 'nostr-tools';
import { SimplePool } from 'nostr-tools';
export default class NostrClient {
    constructor(relays: string[], opts?: {
        eoseSubTimeout?: number;
        getTimeout?: number;
    });
    pool: SimplePool;
    relays: string[];
    close(relays?: string[]): string[];
    subscribe(filters: Filter[], opts?: SubscriptionOptions): Sub;
    publish(event: Event): Promise<void>;
    fetch(filters: Filter[], opts?: SubscriptionOptions): Promise<Event[]>;
    seenOn(id: string): string[];
}
