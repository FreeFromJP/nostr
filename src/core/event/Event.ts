import { getEventHash, validateEvent, verifySignature, signEvent} from 'nostr-tools'
import { Keys } from '../account/Keys'

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

export type EventOpts = {
    kind?: number
    content?: string
    pubkey?: string
    id?: string
    tags?: string[][]
    created_at?: number
    createdAt?: number
    sig?: string
}

export interface mod {(event: Event, opts: any): void}

//this can be used to build new event or receive incoming event
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
        this.pubkey = opts.pubkey || ''
        this.created_at = opts.createdAt || opts.created_at || Math.floor(Date.now() / 1000)
        this.kind = opts.kind || 1
        this.tags = opts.tags || []
        this.content = opts.content || ''
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
        if(this.id == '') this.id = getEventHash(this)  
        return this.id 
    }

    modify(modFn: mod, opts: any) {
        modFn(this, opts)
    }

    signByKey(keys: Keys) {
        if(keys.canSign()){
            this.pubkey = keys.pubkey
            this.hash()
            this.sig = signEvent(this, keys.privkey)
        }else{
            throw new Error('cannot get signed')
        }
    }
}
