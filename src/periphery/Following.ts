import { Filter, Sub } from 'nostr-tools'
import { now } from 'src/core/utils/Misc'
import Note from 'src/model/Note'

import { decodeKey } from '../core/account/Keys'
import { KnownEventKind } from '../core/event/Event'
import { sortDesc } from './Alignment'
import NostrClient from './NostrClient'

export default class Following {
    notes: Note[] = []
    followingPubkeysRaw: string[] = [] //if following changed, make a new one
    sub?: Sub

    //accept encoded keys
    constructor(followings: string[]) {
        this.followingPubkeysRaw = followings.map((k) => decodeKey(k))
    }

    /**
     * get events from history
     * @param client
     * @param limit
     * @param cb: callback function when data fetched
     * @param until: created_at exclusive
     */
    async digging(client: NostrClient, limit = 100, cb: (ms: Note[]) => void, until?: number) {
        const filter_fetch_history: Filter = {
            kinds: [KnownEventKind.NOTE],
            authors: this.followingPubkeysRaw,
            limit: limit,
        }
        if (until != null) {
            filter_fetch_history.until = until
        } else if (this.notes.length > 0) {
            filter_fetch_history.until = this.notes[this.notes.length - 1].created_at
        }

        const results = await client.fetch([filter_fetch_history])
        const newNotes = sortDesc(results).map((x) => new Note(x as Note))
        this.notes = this.notes.concat(newNotes)
        cb(newNotes)
    }

    /**
     * deal with incoming notes. can also used for device wake-up/network recovery after a while
     * @param client subscribe incoming note, can't ensure the order though (won't mess up display order)
     * @param cb: callback function when new note arrived
     * @param since: created_at exclusive
     */
    sub4Incoming(client: NostrClient, cb: (m: Note) => void, since?: number) {
        if (this.sub != null) {
            this.sub.unsub()
        }
        const filter_sub: Filter = {
            kinds: [KnownEventKind.NOTE],
            authors: this.followingPubkeysRaw,
            limit: 0,
        }
        if (since != null) {
            filter_sub.since = since
        } else if (this.notes.length > 0) {
            filter_sub.since = this.notes[0].created_at
        } else {
            filter_sub.since = now()
        }

        const sub = client.subscribe([filter_sub])
        sub.on('event', (event) => {
            const note = new Note(event)
            this.notes.unshift(note)
            cb(note)
        })
        this.sub = sub
    }

    /**
     * for init only
     * @param client
     * @param limit
     * @param cb1: callback function for digging
     * @param cb2: callback function for sub
     */
    async quickStart(client: NostrClient, limit = 100, cb1: (ms: Note[]) => void, cb2: (m: Note) => void) {
        this.notes = []
        const current = now()
        await this.digging(client, limit, cb1, current)
        this.sub4Incoming(client, cb2, current - 1)
    }
}
