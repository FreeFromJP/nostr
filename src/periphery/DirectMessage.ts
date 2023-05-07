import type { Filter } from 'nostr-tools'
import { Kind, Sub } from 'nostr-tools'

import { Keys } from '../core/account/Keys'
import EncryptedDirectMessage from '../model/EncryptedDirectMessage'
import type NostrClient from '../periphery/NostrClient'

export default class DirectMessage {
    constructor(opts: { keys: Keys }) {
        this.keys = opts.keys
        this.pubkey = opts.keys.pubkeyRaw
    }

    pubkey: string
    private keys: Keys
    sub?: Sub

    async history(
        client: NostrClient,
        opts: { rescipients: string; limit?: number; until?: number },
    ): Promise<EncryptedDirectMessage[]> {
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

        const list = await client.fetch([filter])

        const data = list.map(async (e) => {
            const dm = EncryptedDirectMessage.from(e)
            await dm.decryptContent(this.keys)
            return dm
        })

        return await Promise.all(data)
    }

    subscribe(
        client: NostrClient,
        cb: (e: EncryptedDirectMessage) => void,
        opts: { limit?: number; since?: number },
    ): void {
        if (this.sub) {
            this.sub.unsub()
        }

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

        const sub = client.subscribe([filter1, filter2])

        sub.on('event', async (e) => {
            const dm = EncryptedDirectMessage.from(e)
            await dm.decryptContent(this.keys)
            cb(dm)
        })
    }
}
