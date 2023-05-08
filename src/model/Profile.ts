import { nip19 } from 'nostr-tools'

import { BaseEvent, EventFinalized, KnownEventKind } from '../core/event/Event'
import { MetaOpts, toMetadata } from '../core/event/EventBuilder'
import Nip05 from '../core/utils/Nip05'
import Contact from './Contact'

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
    contact?: Contact

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

    //add contact info if client happens to know
    setContact(contact: Contact) {
        this.contact = contact
    }

    static from(event: EventFinalized) {
        if (event.kind !== KnownEventKind.METADATA) throw new Error('kind-1 event expected')
        const eventObj = new BaseEvent(event)
        const metadata = JSON.parse(event.content) as MetaOpts
        return new Profile(nip19.npubEncode(eventObj.pubkey), metadata, eventObj.created_at)
    }

    async isNip05Verified() {
        if (!this.nip05) return false
        if (this.nip05.verified) {
            return this.nip05.verified
        }
        if (!this.nip05.url) {
            return false
        }
        this.nip05.verified = await Nip05.verify(nip19.decode(this.pubkey).data as string, this.nip05.url)
        return this.nip05.verified
    }

    toUnsignedEvent(): BaseEvent {
        const event = new BaseEvent()
        const ops: MetaOpts = {
            name: this.name,
            display_name: this.display_name,
            picture: this.picture,
            banner: this.banner,
            about: this.about,
            website: this.website,
            nip05: this.nip05?.url,
            lud06: this.lud06,
            lud16: this.lud16,
        }
        event.modify(toMetadata, ops)
        return event
    }
}
