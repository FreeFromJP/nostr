import type { Event, Filter } from 'nostr-tools'
import { Kind, Sub } from 'nostr-tools'

import type NostrClient from '../periphery/NostrClient'

export default class DirectMessage {
    constructor(opts: { client: NostrClient; pubkey?: string }) {
        this.client = opts.client
        this.pubkey = opts.pubkey
    }

    client: NostrClient
    pubkey: string | undefined

    async history(opts: { rescipients: string; pubkey?: string; limit?: number; until: number }): Promise<Event[]> {
        const { rescipients, until, pubkey = this.pubkey, limit = 10 } = opts

        if (!pubkey) {
            throw new Error('Pubkey is required')
        }
        if (!rescipients) {
            throw new Error('rescipients is required')
        }

        const filter: Filter = {
            kinds: [Kind.EncryptedDirectMessage],
            authors: [pubkey, rescipients],
            '#p': [rescipients, pubkey],
            limit: limit,
            until: until,
        }

        const list = await this.client.fetch([filter])

        return list
    }

    subscribe(opts: { pubkey?: string; limit?: number; since?: number }): Sub {
        const { pubkey = this.pubkey, limit = 500, since } = opts

        if (!pubkey) {
            throw new Error('Pubkey is required')
        }

        const filter1: Filter = {
            kinds: [Kind.EncryptedDirectMessage],
            authors: [pubkey],
            limit: limit,
            since: since,
        }
        const filter2: Filter = {
            kinds: [Kind.EncryptedDirectMessage],
            '#p': [pubkey],
            limit: limit,
            since: since,
        }

        const sub = this.client.subscribe([filter1, filter2])

        return sub
    }
}
