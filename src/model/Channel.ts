import type { Event } from 'nostr-tools'
import { Kind } from 'nostr-tools'

import { BaseEvent } from '../core/event/Event'
import { now } from '../core/utils/Misc'

export default class Channel {
    constructor(opts: {
        name: string
        about: string
        picture: string
        creator: string
        id?: string
        relay?: string
        lastUpdatedAt?: number
        extra?: { [x: string]: any }
    }) {
        this.name = opts.name
        this.about = opts.about
        this.picture = opts.picture

        opts.extra && (this.extra = opts.extra)

        this.id = opts.id || ''
        this.creator = opts.creator
        this.relay = opts.relay || ''
        this.lastUpdatedAt = opts.lastUpdatedAt || now()
    }

    name = ''
    about = ''
    picture = ''
    extra: { [x: string]: any } = {}

    id = ''
    relay = ''
    creator: string
    lastUpdatedAt: number

    static from(event40: Event, event41s?: Event[]): Channel {
        const creator = event40.pubkey
        const id = event40.id

        let last: Event | undefined = undefined

        if (event41s) {
            last = event41s
                .filter((e) => {
                    if (e.pubkey !== creator) {
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
            creator,
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

    toUnsignedEvent(): BaseEvent {
        const content = JSON.stringify({
            name: this.name,
            about: this.about,
            picture: this.picture,
            ...this.extra,
        })

        if (!this.id) {
            const event = new BaseEvent({
                kind: Kind.ChannelCreation,
                tags: [] as string[][],
                content: content,
            } as Event)

            return event
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
