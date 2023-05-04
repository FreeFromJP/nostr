import type { Event } from 'nostr-tools'
import { Kind } from 'nostr-tools'

import type { Keys } from '../core/account/Keys'
import { BaseEvent } from '../core/event/Event'

export default class EncryptedDirectMessage extends BaseEvent {
    constructor(opts: { plaintext: string; recipients: string; replyId?: string; relay?: string }) {
        const tags: string[][] = []

        tags.push(['p', opts.recipients])

        if (opts.replyId) {
            tags.push(['e', opts.replyId, opts.relay || '', 'reply'])
        }

        super({
            tags: tags,
            kind: Kind.EncryptedDirectMessage,
            content: '',
        } as Event)

        this.recipients = opts.recipients
        this.plaintext = opts.plaintext
    }

    recipients: string
    plaintext = ''

    static from(event: Event): EncryptedDirectMessage {
        if (event.kind !== Kind.EncryptedDirectMessage) {
            throw new Error(`Must be an kind-${Kind.EncryptedDirectMessage}: encrypted direct message`)
        }

        const recipientsTags = event.tags.filter((t) => t[0] === 'p')[0]
        const recipients = recipientsTags && recipientsTags[1]

        const edm = new EncryptedDirectMessage({
            plaintext: '',
            recipients: recipients,
        })
        edm.tags = event.tags
        edm.content = event.content
        edm.pubkey = event.pubkey
        edm.id = event.id
        edm.sig = event.sig
        edm.created_at = event.created_at

        return edm
    }

    async encryptContent(keys: Keys): Promise<string> {
        if (this.content) {
            return this.content
        }
        if (!this.recipients) {
            return ''
        }

        this.pubkey = keys.pubkey()
        this.content = await keys.encrypt(this.recipients, this.plaintext)
        return this.content
    }

    async decryptContent(keys: Keys): Promise<string> {
        if (this.plaintext) {
            return this.plaintext
        }
        if (!this.recipients) {
            return ''
        }

        this.plaintext = await keys.decrypt(this.recipients, this.content)
        return this.plaintext
    }

    toUnsignedEvent(): BaseEvent {
        const event = new BaseEvent({
            kind: this.kind,
            content: this.content,
            tags: this.tags,
            created_at: this.created_at,
        } as Event)
        return event
    }
}
