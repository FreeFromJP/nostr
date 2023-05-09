import type { Event } from 'nostr-tools';
import type { Keys } from '../core/account/Keys';
import { BaseEvent } from '../core/event/Event';
export default class EncryptedDirectMessage extends BaseEvent {
    constructor(opts: {
        plaintext: string;
        recipients: string;
        replyId?: string;
        relay?: string;
    });
    recipients: string;
    plaintext: string;
    static from(event: Event): EncryptedDirectMessage;
    encryptContent(keys: Keys): Promise<string>;
    decryptContent(keys: Keys): Promise<string>;
    toUnsignedEvent(): BaseEvent;
}
