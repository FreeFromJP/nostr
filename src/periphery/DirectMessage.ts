import type { Filter } from 'nostr-tools'
import { Kind, Sub } from 'nostr-tools'

import { Keys } from '../core/account/Keys'
import EncryptedDirectMessage from '../model/EncryptedDirectMessage'
import type NostrClient from '../periphery/NostrClient'

export default class DirectMessage {
    constructor(opts: { client: NostrClient; pubkey: string } | { client: NostrClient; keys: Keys }) {
        this.client = opts.client
        // @ts-ignore
        this.keys = opts.keys
        // @ts-ignore
        this.pubkey = opts.keys ? opts.keys.pubkeyRaw : opts.pubkey
    }

    client: NostrClient
    pubkey: string
    keys: Keys | undefined

    eventListeners: Set<any> = new Set()

    async history(opts: { rescipients: string; limit?: number; until: number }): Promise<EncryptedDirectMessage[]> {
        const { rescipients, until, limit = 10 } = opts
        const pubkey = this.pubkey

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

        const data = list.map(async (e) => {
            const dm = EncryptedDirectMessage.from(e)
            if (this.keys) {
                await dm.decryptContent(this.keys)
            }
            return dm
        })

        return await Promise.all(data)
    }

    subscribe(opts: { limit?: number; since?: number }): Sub {
        const { limit = 500, since } = opts
        const pubkey = this.pubkey

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

        sub.on('event', async (e) => {
            const dm = EncryptedDirectMessage.from(e)
            if (this.keys) {
                await dm.decryptContent(this.keys)
            }
            for (const cb of this.eventListeners.values()) cb(dm)
        })

        return {
            ...sub,
            on(type, cb) {
                if (type === 'event') {
                    this.eventListeners.add(cb)
                } else {
                    sub.on(type, cb)
                }
            },
            off(type, cb) {
                if (type === 'event') {
                    this.eventListeners.delete(cb)
                } else {
                    sub.off(type, cb)
                }
            },
        }
    }
}
