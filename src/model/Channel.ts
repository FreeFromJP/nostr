import type { Event } from 'nostr-tools'
import { Kind } from 'nostr-tools'

import { BaseEvent } from '../core/event/Event'
import { now } from '../core/utils/Misc'

export default class Channel {
    constructor(opts: {
        name: string
        about: string
        picture: string
        id?: string
        pubkey?: string
        relay?: string
        lastUpdatedAt?: number
        extra?: { [x: string]: any }
    }) {
        this.name = opts.name
        this.about = opts.about
        this.picture = opts.picture

        opts.extra && (this.extra = opts.extra)

        this.id = opts.id || ''
        this.relay = opts.relay || ''
        this.lastUpdatedAt = opts.lastUpdatedAt || now()
    }

    name = ''
    about = ''
    picture = ''
    extra: { [x: string]: any } = {}

    id = ''
    relay = ''
    pubkey?: string
    lastUpdatedAt: number

    static from(event40: Event, event41s?: Event[]): Channel {
        const pubkey = event40.pubkey
        const id = event40.id

        let last: Event | undefined = undefined

        if (event41s) {
            last = event41s
                .filter((e) => {
                    if (e.pubkey !== pubkey) {
                        return false
                    }
                    const eid = e.tags.find((t) => t[0] === 'e')?.[1]
                    if (eid !== id) {
                        return false
                    }
                    return true
                })
                .sort((a, b) => {
                    return a.created_at - b.created_at >= 0 ? -1 : 1
                })[0]
        }

        const content = last ? last.content : event40.content
        const [_, __, relay] = last ? last.tags.find((t) => t[0] === 'e')! : []

        const { name, about, picture, ...extra } = Channel.parseContent(content)
        return new Channel({
            id,
            pubkey,
            name,
            about,
            picture,
            extra,
            relay,
            lastUpdatedAt: last ? last.created_at : event40.created_at,
        })
    }
    static parseContent(content: string) {
        const defaultInfo = {
            name: '',
            about: '',
            picture: '',
        }
        try {
            const json = JSON.parse(content)
            const o = Object.assign(defaultInfo, json)

            return o
        } catch (e) {
            console.error(e)
            return defaultInfo
        }
    }

    toUnsignedEvent(kind: Kind.ChannelCreation | Kind.ChannelMetadata = Kind.ChannelMetadata): BaseEvent {
        const content = JSON.stringify({
            name: this.name,
            about: this.about,
            picture: this.picture,
            ...this.extra,
        })

        if (kind === Kind.ChannelCreation) {
            const event = new BaseEvent({
                kind: Kind.ChannelCreation,
                tags: [] as string[][],
                content: content,
            } as Event)

            return event
        }

        if (!this.id) {
            throw new Error('id is required')
        }
        const tags = [['e', this.id, this.relay]]

        const event = new BaseEvent({
            kind: Kind.ChannelMetadata,
            tags: tags,
            content: content,
        } as Event)

        return event
    }
}
