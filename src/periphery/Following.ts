import { Filter, Sub } from 'nostr-tools'
import { now } from 'src/core/utils/Misc'

import { BaseEvent as Message, EventFinalized, parseEvent } from '../core/event/Event'
import NostrClient from './NostrClient'

//align in decreasing (created_at) order
function sortDesc(events: EventFinalized[]) {
    return events.map((x) => parseEvent(x) as Message).sort((a, b) => b.created_at - a.created_at)
}

export default class Following {
    messages: Message[] = []
    followingPubkeysRaw: string[] = []
    sub?: Sub

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
    async digging(client: NostrClient, limit = 100, cb: (ms: Message[]) => void, until?: number) {
        const filter_fetch_history: Filter = {
            kinds: [1],
            authors: this.followingPubkeysRaw,
            limit: limit,
        }
        if (until != null) {
            filter_fetch_history.until = until
        } else if (this.messages.length > 0) {
            filter_fetch_history.until = this.messages[this.messages.length - 1].created_at
        }

        const results = await client.fetch([filter_fetch_history])
        const newMessages = sortDesc(results)
        this.messages = this.messages.concat(newMessages)
        cb(newMessages)
    }

    /**
     * deal with incoming messages
     * @param client subscribe incoming message, can't ensure the order though (won't mess up display order)
     * @param cb: callback function when new message arrived
     * @param since: created_at exclusive
     */
    sub4Incoming(client: NostrClient, cb: (m: Message) => void, since?: number) {
        if (this.sub != null) {
            this.sub.unsub()
        }
        const filter_sub: Filter = {
            kinds: [1],
            authors: this.followingPubkeysRaw,
            limit: 0,
        }
        if (since != null) {
            filter_sub.since = since
        } else if (this.messages.length > 0) {
            filter_sub.since = this.messages[0].created_at
        }
        const sub = client.subscribe([filter_sub])
        sub.on('event', (event) => {
            const message = parseEvent(event)
            this.messages.unshift(message)
            cb(message)
        })
        this.sub = sub
    }

    /**
     * for init, wake up device, network recover, etc...
     * @param client
     * @param limit
     * @param cb1: callback function for digging
     * @param cb2: callback function for sub
     */
    async refresh(client: NostrClient, limit = 100, cb1: (ms: Message[]) => void, cb2: (m: Message) => void) {
        const current = now()
        await this.digging(client, limit, cb1, current)
        this.sub4Incoming(client, cb2, current - 1)
    }
}
