import { Sub } from 'nostr-tools';
import Note from 'src/model/Note';
import NostrClient from './NostrClient';
export default class Following {
    notes: Note[];
    followingPubkeysRaw: string[];
    sub?: Sub;
    constructor(followings: string[]);
    /**
     * get events from history
     * @param client
     * @param limit
     * @param cb: callback function when data fetched
     * @param until: created_at exclusive
     */
    digging(client: NostrClient, cb: (ms: Note[]) => void, limit?: number, until?: number): Promise<void>;
    /**
     * deal with incoming notes. can also used for device wake-up/network recovery after a while
     * @param client subscribe incoming note, can't ensure the order though (won't mess up display order)
     * @param cb: callback function when new note arrived
     * @param since: created_at exclusive
     */
    sub4Incoming(client: NostrClient, cb: (m: Note) => void, limit?: number, since?: number): void;
    /**
     * for init only
     * @param client
     * @param limit
     * @param cb1: callback function for digging
     * @param cb2: callback function for sub
     */
    quickStart(client: NostrClient, limit: number | undefined, cb1: (ms: Note[]) => void, cb2: (m: Note) => void): Promise<void>;
}
