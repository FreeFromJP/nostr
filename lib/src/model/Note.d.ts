import NIP10 from 'src/core/utils/Nip10';
import { BaseEvent, EventFinalized } from '../core/event/Event';
export default class Note extends BaseEvent {
    nip10: NIP10;
    replies: Note[];
    parent: Note | null;
    constructor(event: EventFinalized, parent?: Note | null);
    addReply(reply: Note): void;
    findAncestor(): Note | null;
    traverseNotes(): Note[];
}
