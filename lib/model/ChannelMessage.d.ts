import { EventFinalized } from '../core/event/Event';
import { BaseEvent } from '../core/event/Event';
import Channel from './Channel';
export default class ChannelMessage extends BaseEvent {
    constructor(opts: {
        content: string;
        channel: Pick<Channel, 'id' | 'relay'>;
        replyTo?: Pick<ChannelMessage, 'pubkey' | 'id' | 'relay'>;
    });
    relay: string;
    channel: {
        id: string;
        relay: string;
    };
    replyTo?: {
        pubkey: string;
        id: string;
        relay: string;
    };
    static from(event: EventFinalized): ChannelMessage | null;
    toUnsignedEvent(): {
        kind: number;
        tags: string[][];
        content: string;
        created_at: number;
    };
}
