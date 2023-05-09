import { BaseEvent, EventFinalized } from '../core/event/Event';
import Note from '../model/Note';
import NostrClient from '../periphery/NostrClient';
export declare class Repost extends BaseEvent {
    orgNote?: Note;
    constructor(event: EventFinalized);
    loadOrgNote(client: NostrClient): Promise<void>;
}
