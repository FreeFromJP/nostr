import { BaseEvent, EventFinalized } from '../core/event/Event';
import { ParseContentItem } from '../core/utils/Misc';
import NIP10 from '../core/utils/Nip10';
export default class Note extends BaseEvent {
    nip10: NIP10;
    replies: Note[];
    parent: Note | null;
    reactions?: EventFinalized[];
    reposts: number;
    parsedContent?: ParseContentItem[];
    constructor(event: EventFinalized, parent?: Note | null);
    addReply(reply: Note): void;
    findAncestor(): Note | null;
    traverseNotes(): Note[];
    parseContent(opts?: {
        httpUrl: boolean;
        nostrUri: boolean;
        tag: boolean;
    }): ParseContentItem[];
}
