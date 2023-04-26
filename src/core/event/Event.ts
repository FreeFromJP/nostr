import { getEventHash, validateEvent, verifySignature } from 'nostr-tools'

//for reference
export const KnownEventKind = {
    METADATA: 0,
    NOTE: 1,
    RELAY: 2,
    CONTACT: 3,
    DM: 4,
    DELETE: 5,
    SHARE: 6,
    REACTION: 7,
    BADGE_PROFILE: 8,
    CHATROOM: 42,
    BDADE_REWARD: 30008,
    BADGE_DEFINATION: 30009,
}

export interface EventOpts {
    pubkey: string
    kind: number
    content: string
    id?: string
    tags?: string[][]
    created_at?: number
    createdAt?: number
    sig?: string
}

export class Event {
    id: string
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
    sig: string

    constructor(opts: EventOpts) {
        this.id = opts.id || ''
        this.pubkey = opts.pubkey
        this.created_at = opts.createdAt || opts.created_at || Math.floor(Date.now() / 1000)
        this.kind = opts.kind
        this.tags = opts.tags || []
        this.content = opts.content
        this.sig = opts.sig || ''
    }

    get author() {
        return this.pubkey
    }

    get createdAt() {
        return this.created_at
    }

    validate() {
        return validateEvent(this) && verifySignature(this)
    }

    hash() {
        this.id = getEventHash(this)
        return this.id
    }
}
