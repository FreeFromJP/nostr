export enum TagType {
    P = 'p',
    E = 'e',
    T = 't',
}
export enum MarkerType {
    REPLY = 'reply',
    ROOT = 'root',
    MENTION = 'mention',
}

export type PubkeyTagDescription = {
    type: TagType.P
    ref: string
}
export type EventTagDescription = {
    type: TagType.E
    ref: string
    relay: string
    marker?: MarkerType
}
export type TagTagDescription = {
    type: TagType.T
    ref: string
}

export type TagDescription = PubkeyTagDescription | EventTagDescription | TagTagDescription

export default class Tags {
    constructor(descriptions: TagDescription[] = []) {
        const d = descriptions
            .map((desc) => {
                if (desc.type === TagType.P) {
                    return {
                        type: desc.type,
                        ref: desc.ref,
                    }
                } else if (desc.type === TagType.E) {
                    return {
                        type: desc.type,
                        ref: desc.ref,
                        relay: desc.relay || '',
                        marker: desc.marker,
                    }
                } else if (desc.type === TagType.T) {
                    return {
                        type: desc.type,
                        ref: desc.ref,
                    }
                }
            })
            .filter((t) => t)
        this.descrtions = d as TagDescription[]
    }

    descrtions: TagDescription[] = []

    getPubkeys(): string[] {
        return this.descrtions.filter((t) => t.type === TagType.P).map((t) => t.ref)
    }

    getEvents(): EventTagDescription[] {
        return this.descrtions.filter((t) => t.type === TagType.E) as EventTagDescription[]
    }

    getReplyEvents(): EventTagDescription[] {
        return this.getEvents().filter((t) => t.marker === MarkerType.REPLY)
    }

    addPubkey(pubkey: string): number {
        const length = this.descrtions.push({
            type: TagType.P,
            ref: pubkey,
        })
        return length - 1
    }

    addEvent(eventId: string, relay: string, marker?: string): number {
        const length = this.descrtions.push({
            type: TagType.E,
            ref: eventId,
            relay: relay,
        })
        return length
    }

    addTag(tag: string): number {
        const length = this.descrtions.push({
            type: TagType.T,
            ref: tag,
        })
        return length
    }

    toArray(): string[][] {
        const r = this.descrtions
            .map((el) => {
                if (el.type === TagType.E) {
                    return [el.type, el.ref, el.relay, el.marker]
                } else if (el.type === TagType.P) {
                    return [el.type, el.ref]
                } else if (el.type === TagType.T) {
                    return [el.type, el.ref]
                }
            })
            .filter((t) => t)

        return r as string[][]
    }

    static fromArray(arr: string[][]): Tags {
        const tags = new Tags()
        arr.forEach((el) => {
            if (el[0] === TagType.E) {
                tags.addEvent(el[1], el[2], el[3])
            } else if (el[0] === TagType.P) {
                tags.addPubkey(el[1])
            } else if (el[0] === TagType.T) {
                tags.addTag(el[1])
            }
        })
        return tags
    }
}
