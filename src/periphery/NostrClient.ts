import type { Event, Filter, Sub, SubscriptionOptions } from 'nostr-tools'
import { SimplePool } from 'nostr-tools'

export default class NostrClient {
    constructor(relays: string[], opts: { eoseSubTimeout?: number; getTimeout?: number } = {}) {
        this.pool = new SimplePool(opts)
        this.relays = relays
    }

    pool: SimplePool
    relays: string[] = []

    close(relays?: string[]) {
        const relaysClosed = relays || this.relays
        const newRelays = this.relays.filter((relay) => !relaysClosed.includes(relay))
        this.relays = newRelays
        this.pool.close(relaysClosed)
        return this.relays
    }

    subscribe(filters: Filter[], opts?: SubscriptionOptions): Sub {
        return this.pool.sub(this.relays, filters, opts)
    }

    publish(event: Event): Promise<void> {
        const relaysLength = this.relays.length
        const pub = this.pool.publish(this.relays, event)

        const p = new Promise<void>((r, j) => {
            let failedTimes = 0

            pub.on('ok', () => {
                r()
            })

            pub.on('failed', (reason: string) => {
                failedTimes++
                if (relaysLength === failedTimes) {
                    j(reason)
                }
            })
        })

        return p
    }

    fetch(filters: Filter[], opts?: SubscriptionOptions): Promise<Event[]> {
        return this.pool.list(this.relays, filters, opts)
    }

    seenOn(id: string): string[] {
        return this.pool.seenOn(id)
    }
}
