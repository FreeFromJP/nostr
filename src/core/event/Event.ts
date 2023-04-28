import { getEventHash, signEvent, validateEvent, verifySignature } from 'nostr-tools'

import { Keys } from '../account/Keys'
import { now } from '../utils/Misc'

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

export type Event = {
    kind?: number
    content?: string
    pubkey?: string
    id?: string
    tags?: string[][]
    created_at?: number
    sig?: string
}

//for existing events
export type EventFinalized = {
    kind: number
    content: string
    pubkey: string
    id: string
    tags: string[][]
    created_at?: number
    createdAt?: number //other clients happened to use this
    sig: string
}

export interface mod {
    (event: BaseEvent, ...opts: any): Promise<void>
}

//this can be used to build new event or receive incoming event
export class BaseEvent {
    id: string
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
    sig: string

    constructor(opts: Event) {
        this.id = opts.id || ''
        this.pubkey = opts.pubkey || ''
        this.created_at = opts.created_at || now()
        this.kind = opts.kind || 0
        this.tags = opts.tags || []
        this.content = opts.content || ''
        this.sig = opts.sig || ''
    }

    get author() {
        return this.pubkey
    }

    validate() {
        return validateEvent(this) && verifySignature(this)
    }

    hash() {
        if (this.id == '') this.id = getEventHash(this)
    }

    async modify(modFn: mod, ...opts: any) {
        await modFn(this, ...opts)
        return this
    }

    signByKey(keys: Keys) {
        if (keys.canSign()) {
            this.pubkey = keys.pubkeyRaw
            this.hash()
            this.sig = signEvent(this, keys.privkeyRaw)
        } else {
            throw new Error('cannot get signed')
        }
    }
}

export function parseEvent(event: EventFinalized): BaseEvent {
    if (event.createdAt == null && event.created_at == null) throw new Error('parse failed: no timestamp')
    const eventObj = new BaseEvent(event)
    if (eventObj.validate()) {
        return eventObj
    } else {
        throw new Error('varification failed')
    }
}
