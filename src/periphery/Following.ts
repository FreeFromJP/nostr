import { Filter } from 'nostr-tools'
import { SortedSet } from 'src/periphery/Alignment'

import { BaseEvent as Message, EventFinalized, parseEvent } from '../core/event/Event'
import NostrClient from './NostrClient'

//maintain a subscription of kind-1 event for authors
export default class Following {
    messages: SortedSet<Message> = new SortedSet<Message>(
        (a, b) => b.created_at - a.created_at,
        (a) => a.id,
    )
    followingPubkeysRaw: string[] = []

    constructor(client: NostrClient, followings: string[]) {
        this.followingPubkeysRaw = followings
    }

    /**
     for init, pull-down refresh, wake-up, change following keys, etc...
     * @param cb1 calls back when first fetch finished
     * @param cb2 calls back when new message arrives
     */
    async refreshAndSub(client: NostrClient, limit = 100, cb1: () => void, cb2: () => void) {
        //there should be a fetch, then a subscribe
        const filter_fetch: Filter = {
            kinds: [1],
            authors: this.followingPubkeysRaw,
            limit: limit,
        }
        const results = await client.fetch([filter_fetch])
        this.insert(results)
        cb1()

        const filter_sub: Filter = {
            kinds: [1],
            authors: this.followingPubkeysRaw,
            limit: 0,
        }
        const sub = client.subscribe([filter_sub], { id: 'following' })
        this.messages.setInternalData([])
        sub.on('event', (event) => {
            try {
                const message = parseEvent(event)
                this.messages.insert(message)
                cb2()
            } catch (e) {
                console.log('error parsing:', event)
            }
        })
    }

    //digging into history
    async getMore(client: NostrClient, until: number, limit = 100, cb: () => void) {
        const filter_fetch_history = {
            kinds: [1],
            authors: this.followingPubkeysRaw,
            until: until,
            limit: limit,
        }
        const result = await client.fetch([filter_fetch_history])
        this.insert(result)
        cb()
    }

    private async insert(messages: EventFinalized[]) {
        for (const m of messages) {
            try {
                const message = parseEvent(m)
                this.messages.insert(message)
            } catch (e) {
                console.log('error parsing:', m)
            }
        }
    }
}
