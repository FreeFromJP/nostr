import Note from 'src/model/Note';
import NostrClient from './NostrClient';
export default class Thread {
    root: Note;
    collection: {
        [id: string]: Note;
    };
    constructor(root: Note);
    loadReply(client: NostrClient, limit?: number, until?: number): Promise<void>;
    unscrollReplies(note: Note): Note[];
}
