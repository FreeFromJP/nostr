import { Sub } from 'nostr-tools';
import { Keys } from '../core/account/Keys';
import EncryptedDirectMessage from '../model/EncryptedDirectMessage';
import type NostrClient from '../periphery/NostrClient';
export default class DirectMessage {
    constructor(opts: {
        keys: Keys;
    });
    pubkey: string;
    private keys;
    sub?: Sub;
    history(client: NostrClient, opts: {
        rescipients: string;
        limit?: number;
        until?: number;
    }): Promise<EncryptedDirectMessage[]>;
    subscribe(client: NostrClient, cb: (e: EncryptedDirectMessage) => void, opts: {
        limit?: number;
        since?: number;
    }): void;
}
