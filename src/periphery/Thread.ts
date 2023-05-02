import Note from 'src/model/Note'

import { fetchRepliesOrdered } from './eventFetcher'
import NostrClient from './NostrClient'

export default class Thread {
    root: Note
    collection: { [id: string]: Note } = {} //all related ids

    constructor(root: Note) {
        this.root = root
        this.collection[root.id] = root
    }

    async loadReply(client: NostrClient, limit = 500, until?: number) {
        const result = await fetchRepliesOrdered(client, this.root.id, limit, until)
        result.forEach((x) => {
            this.collection[x.id] = x
        })
        const traverse = (note: Note) => {
            const repliesInFork = result.filter((x) => x.nip10.refer == note.id)
            repliesInFork.forEach((n) => {
                note.addReply(n)
                traverse(n)
            })
        }
        traverse(this.root)
    }

    unscrollReplies(note: Note): Note[] {
        if (this.collection[note.id] == null) return []
        return note.traverseNotes()
    }
}
