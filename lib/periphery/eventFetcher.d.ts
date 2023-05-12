import { EventFinalized } from '../core/event/Event';
import Contact from '../model/Contact';
import Note from '../model/Note';
import Profile from '../model/Profile';
import NostrClient from './NostrClient';
export declare function fetchProfiles(client: NostrClient, pubkeys: string[]): Promise<{
    [pubkey: string]: Profile;
}>;
export declare function fetchContact(client: NostrClient, pubkeyRaw: string): Promise<Contact | null>;
export declare function fetchNotes(client: NostrClient, ids: string[]): Promise<Note[]>;
export declare function fetchRepliesOrdered(client: NostrClient, root_id: string, limit?: number, until?: number): Promise<Note[]>;
export declare function fetchReposts(client: NostrClient, eventId: string): Promise<EventFinalized[]>;
export declare function fetchReactions(client: NostrClient, eventId: string): Promise<EventFinalized[]>;
export declare function fetchFollowers(client: NostrClient, pubkeyRaw: string, until?: number, limit?: number): Promise<Contact[]>;
export declare function fetchFollowersAMAP(client: NostrClient, pubkeyRaw: string, cb: (contracts: Contact[]) => void, maxFetch?: number, eachBatch?: number): Promise<Contact[]>;
