import { Filter, Sub } from 'nostr-tools'

import { KnownEventKind } from '../core/event/Event'
import { EventFinalized } from '../core/event/Event'
import { now } from '../core/utils/Misc'
import Note from '../model/Note'
import { sortDesc } from './Alignment'
import NostrClient from './NostrClient'
import Repost from './Repost'

export type FollowingItem = Note | Repost

function parse2Item(event: EventFinalized): FollowingItem {
    if (event.kind === KnownEventKind.NOTE) {
        return new Note(event)
    } else if (event.kind === KnownEventKind.REPOST) {
        return new Repost(event)
    } else {
        throw new Error('not a note nor repost')
    }
}

export default class Following {
    notes: FollowingItem[] = []
    followingPubkeysRaw: string[] = [] //if following changed, make a new one
    sub?: Sub

    //accept encoded keys
    constructor(followings: string[]) {
        this.followingPubkeysRaw = followings
    }

    /**
     * get events from history
     * @param client
     * @param limit
     * @param cb: callback function when data fetched
     * @param until: created_at exclusive
     */
    async digging(client: NostrClient, cb: (ms: FollowingItem[]) => void, limit = 100, until?: number) {
        const filter_fetch_history: Filter = {
            kinds: [KnownEventKind.NOTE, KnownEventKind.REPOST],
            authors: this.followingPubkeysRaw,
            limit: limit,
        }
        if (until !== null && until !== undefined) {
            filter_fetch_history.until = until
        } else if (this.notes.length > 0) {
            filter_fetch_history.until = this.notes[this.notes.length - 1].created_at
        }

        const results = await client.fetch([filter_fetch_history])
        const newNotes = sortDesc(results).map((x) => parse2Item(x as EventFinalized))
        this.notes = this.notes.concat(newNotes)
        cb(newNotes)
    }

    /**
     * deal with incoming notes. can also used for device wake-up/network recovery after a while
     * @param client subscribe incoming note, can't ensure the order though (won't mess up display order)
     * @param cb: callback function when new note arrived
     * @param since: created_at exclusive
     */
    sub4Incoming(client: NostrClient, cb: (m: FollowingItem) => void, limit = 100, since?: number) {
        if (this.sub) {
            this.sub.unsub()
        }
        const filter_sub: Filter = {
            kinds: [KnownEventKind.NOTE],
            authors: this.followingPubkeysRaw,
            limit: limit,
        }
        if (since !== null && since !== undefined) {
            filter_sub.since = since
        } else if (this.notes.length > 0) {
            filter_sub.since = this.notes[0].created_at
        } else {
            filter_sub.since = now()
        }

        const sub = client.subscribe([filter_sub])
        sub.on('event', (event) => {
            const note = parse2Item(event)
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
    async quickStart(
        client: NostrClient,
        limit = 100,
        cb1: (ms: FollowingItem[]) => void,
        cb2: (m: FollowingItem) => void,
    ) {
        this.notes = []
        const current = now()
        await this.digging(client, cb1, limit, current)
        this.sub4Incoming(client, cb2, 0, current - 1)
    }
}
