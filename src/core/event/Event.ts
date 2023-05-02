import { Event, getEventHash, signEvent, validateEvent, verifySignature } from 'nostr-tools'

import { Keys } from '../account/Keys'
import { now } from '../utils/Misc'

export { Event as EventFinalized }
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

export type Tag = string[]
export type Tags = Tag[]

export interface mod {
    (eventObj: BaseEvent, ...opts: any): Promise<void>
}

//this can be used to build new event or receive incoming event
export class BaseEvent {
    id: string
    pubkey: string
    created_at: number
    kind: number
    tags: Tags
    content: string
    sig: string

    constructor(event?: Event) {
        if (event) {
            this.id = event.id
            this.pubkey = event.pubkey
            this.created_at = event.created_at
            this.kind = event.kind
            this.tags = event.tags
            this.content = event.content
            this.sig = event.sig
        } else {
            this.id = ''
            this.pubkey = ''
            this.created_at = now()
            this.kind = -1
            this.tags = []
            this.content = ''
            this.sig = ''
        }
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

export function parseEvent(event: Event): BaseEvent {
    const eventObj = new BaseEvent(event)
    if (eventObj.validate()) {
        return eventObj
    } else {
        throw new Error('varification failed')
    }
}
