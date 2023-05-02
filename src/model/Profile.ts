import { nip19 } from 'nostr-tools'

import { BaseEvent, EventFinalized, KnownEventKind } from '../core/event/Event'
import { MetaOpts } from '../core/event/EventBuilder'
import Nip05 from '../core/utils/Nip05'

export default class Profile {
    pubkey: string
    name: string
    display_name?: string
    picture?: string
    banner?: string
    about?: string
    website?: string
    lud06?: string
    lud16?: string
    lastUpdatedAt: number
    nip05?: {
        url?: string
        verified?: boolean
    }

    constructor(pubkey: string, metadata: MetaOpts, lastUpdatedAt: number) {
        this.pubkey = pubkey
        this.lastUpdatedAt = lastUpdatedAt
        this.name = metadata.name
        this.about = metadata.about
        this.picture = metadata.picture
        this.nip05 = {
            url: metadata.nip05,
            verified: undefined,
        }
        this.lud06 = metadata.lud06
        this.lud16 = metadata.lud16
    }

    static from(event: EventFinalized) {
        if (event.kind != KnownEventKind.METADATA) throw new Error('kind-1 event expected')
        const eventObj = new BaseEvent(event)
        const metadata = JSON.parse(event.content) as MetaOpts
        return new Profile(nip19.npubEncode(eventObj.pubkey), metadata, eventObj.created_at)
    }

    async isNip05Verified() {
        if (this.nip05 == null) return false
        if (this.nip05.verified != null) {
            return this.nip05.verified
        }
        if (!this.nip05.url) {
            return false
        }
        this.nip05.verified = await Nip05.verify(nip19.decode(this.pubkey).data as string, this.nip05.url)
        return this.nip05.verified
    }
}
