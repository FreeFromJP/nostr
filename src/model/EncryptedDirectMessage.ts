import type { Event } from 'nostr-tools'
import { Kind } from 'nostr-tools'

import type { Keys } from '../core/account/Keys'
import { BaseEvent } from '../core/event/Event'
import Tags, { MarkerType } from '../core/event/Tags'

export default class EncryptedDirectMessage extends BaseEvent {
    constructor(opts: { plaintext: string; recipients: string; replyId?: string; relay?: string }) {
        const tags = new Tags()
        if (opts.replyId) {
            tags.addEvent(opts.replyId, opts.relay || '', MarkerType.REPLY)
        }
        tags.addPubkey(opts.recipients)
        const tagsArray = tags.toArray()

        super({
            tags: tagsArray,
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
        const tags = Tags.fromArray(event.tags)
        const recipients = tags.getPubkeys()[0]

        const edm = new EncryptedDirectMessage({
            plaintext: '',
            recipients: recipients,
        })
        edm.tags = event.tags
        edm.content = event.content
        edm.pubkey = event.pubkey
        edm.id = event.id
        edm.sig = event.sig

        return edm
    }

    async encryptContent(keys: Keys): Promise<string> {
        if (this.content) {
            return this.content
        }

        this.pubkey = keys.pubkey()
        this.content = await keys.encrypt(this.recipients, this.plaintext)
        return this.content
    }

    async decryptContent(keys: Keys): Promise<string> {
        if (this.plaintext) {
            return this.plaintext
        }

        this.plaintext = await keys.decrypt(this.recipients, this.content)
        return this.plaintext
    }
}
