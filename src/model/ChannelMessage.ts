import type { Event } from 'nostr-tools'
import { Kind } from 'nostr-tools'

import { BaseEvent } from '../core/event/Event'
import Channel from './Channel'

export default class ChannelMessage extends BaseEvent {
    constructor(opts: {
        content: string
        channel: Pick<Channel, 'id' | 'relay'>
        replyTo?: Pick<ChannelMessage, 'pubkey' | 'id' | 'relay'>
    }) {
        if (!opts.channel.id) {
            throw new Error('channel id is required')
        }
        if (opts.replyTo && !opts.replyTo.id) {
            throw new Error('replyTo id is required')
        }

        super({
            content: opts.content,
            kind: Kind.ChannelMessage,
        } as Event)

        this.channel = opts.channel
        this.replyTo = opts.replyTo
    }

    relay = ''
    channel: { id: string; relay: string }
    replyTo?: { pubkey: string; id: string; relay: string }

    static from(event: Event): ChannelMessage | null {
        if (event.kind !== Kind.ChannelMessage) {
            throw new Error(`Must be an kind-${Kind.ChannelMessage}: channel message`)
        }

        const channelTags = event.tags.find((t) => t[0] === 'e' && t[3] === 'root')
        const channelId = channelTags && channelTags[1]
        const channelRelay = channelTags && channelTags[2]

        const replyToTags = event.tags.find((t) => t[0] === 'e' && t[3] === 'reply')
        const replyToId = replyToTags && replyToTags[1]
        const replyToRelay = replyToTags ? replyToTags[2] : ''

        const replyToPubkeyTags = event.tags.find((t) => t[0] === 'p')
        const replyToPubkey = replyToPubkeyTags && replyToPubkeyTags[1]

        if (!channelId) {
            return null
        }

        const cm = new ChannelMessage({
            channel: { id: channelId, relay: channelRelay || '' },
            replyTo:
                replyToId && replyToPubkey
                    ? {
                          id: replyToId,
                          relay: replyToRelay!,
                          pubkey: replyToPubkey!,
                      }
                    : undefined,
            content: event.content,
        })

        cm.tags = event.tags
        cm.content = event.content
        cm.pubkey = event.pubkey
        cm.id = event.id
        cm.sig = event.sig
        cm.created_at = event.created_at

        return cm
    }

    toUnsignedEvent() {
        const tags: string[][] = []
        tags.push(['e', this.channel.id!, this.channel.relay, 'root'])
        if (this.replyTo) {
            tags.push(['e', this.replyTo.id, this.replyTo.relay, 'reply'])
            tags.push(['p', this.replyTo.pubkey, this.replyTo.relay])
        }

        return {
            kind: 42,
            tags,
            content: this.content,
            created_at: Date.now(),
        }
    }
}
