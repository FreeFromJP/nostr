import NIP10 from 'src/core/utils/Nip10'

import { BaseEvent, EventFinalized } from '../core/event/Event'

export default class Note extends BaseEvent {
    nip10: NIP10
    //structure related
    replies: Note[] = []
    parent: Note | null
    //display related
    reactions?: EventFinalized[]
    reposts = 0
    constructor(event: EventFinalized, parent: Note | null = null) {
        super(event)
        this.nip10 = new NIP10(event.tags)
        this.parent = parent
    }

    addReply(reply: Note): void {
        reply.parent = this
        this.replies.push(reply)
    }

    findAncestor(): Note | null {
        let ancestor: Note | null = this.parent
        while (ancestor && ancestor.parent) {
            ancestor = ancestor.parent
        }
        return ancestor
    }

    traverseNotes(): Note[] {
        const result: Note[] = []
        const traverse = (note: Note) => {
            result.push(note)
            note.replies.sort((a, b) => a.created_at - b.created_at)
            for (const reply of note.replies) {
                traverse(reply)
            }
        }
        traverse(this)
        return result
    }
}
