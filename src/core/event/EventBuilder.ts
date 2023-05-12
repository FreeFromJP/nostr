import { nip19 } from 'nostr-tools'

import { Keys } from '../account/Keys'
import NIP10 from '../utils/Nip10'
import { BaseEvent, EventFinalized, KnownEventKind, Tags } from './Event'

//kind-0 metadata
export interface MetaOpts {
    name: string
    display_name?: string
    picture?: string
    banner?: string
    about?: string
    website?: string
    nip05?: string
    lud06?: string
    lud16?: string
}

export async function toMetadata(event: BaseEvent, metadata: MetaOpts) {
    event.kind = KnownEventKind.METADATA
    event.content = JSON.stringify(metadata)
}

//kind-1 short text note
export async function toNote(event: BaseEvent, content: string) {
    event.kind = KnownEventKind.NOTE
    event.content = content
}

//kind-1 reply
export async function toReply(event: BaseEvent, referEvent: BaseEvent, content: string) {
    event.kind = KnownEventKind.NOTE
    event.content = content
    const nip10 = new NIP10(referEvent.tags)
    //reply to root
    if (!nip10.root && !nip10.refer) {
        //do nothing
    } else if (!nip10.root && nip10.refer) {
        //reply to level 1 child
        nip10.root = nip10.refer
    } else if (nip10.root && nip10.refer) {
        nip10.addMentions([nip10.refer])
    } else {
        throw new Error('Relpy to invaild content')
    }
    nip10.addPubkeys([referEvent.author])
    nip10.setRefer(referEvent.id)
    const tags = nip10.toTags()
    event.tags = tags
}

//kind-2 todo: recommend relay

//kind-3 contact, using nip-02 and conventional relays recording in content
export type RelayInfo = { [url: string]: { read: boolean; write: boolean } }
export type Contacts = [p: string, pubkeyRaw: string, mainRelay?: string, petname?: string][]

export async function toContact(event: BaseEvent, relays: RelayInfo, contacts: Contacts) {
    event.kind = KnownEventKind.CONTACT
    event.content = JSON.stringify(relays)
    const tags = contacts.map((c) => {
        const arr: string[] = []
        arr.push('p')
        arr.push(c[1])
        if (c[2]) arr.push(c[2]) //main relay
        if (c[3]) arr.push(c[3]) //petname
        return arr
    })
    event.tags = tags
}

//kind-4 DM
export async function toDM(
    event: BaseEvent,
    keys: Keys,
    otherPubkeyRaw: string,
    plainText: string,
    opts?: {
        relay?: string
        replyId?: string
    },
) {
    event.kind = KnownEventKind.DM
    event.content = await keys.encrypt(otherPubkeyRaw, plainText)
    event.tags = [['p', otherPubkeyRaw]]
    if (opts?.replyId) {
        event.tags.push(['e', opts.replyId, opts.relay || '', 'reply'])
    }
}

//kind-6 repost
export async function toRepost(event: BaseEvent, orgEvent: EventFinalized) {
    event.kind = KnownEventKind.REPOST
    event.content = JSON.stringify(orgEvent)
    const tags: Tags = orgEvent.tags.filter((t) => t[0] === 'p')
    tags.unshift(['e', orgEvent.id])
    tags.push(['p', orgEvent.pubkey])
}

//kind-7 reaction, emojis are like: 🖤 🐶 🌧️ 😼 etc...
export async function toReaction(event: BaseEvent, orgEvent: EventFinalized, emoji: string) {
    event.kind = KnownEventKind.REACTION
    event.content = emoji
    const e_tags: Tags = orgEvent.tags.filter((t) => t[0] === 'e')
    const p_tags: Tags = orgEvent.tags.filter((t) => t[0] === 'p')
    event.tags = e_tags
        .concat([['e', orgEvent.id]])
        .concat(p_tags)
        .concat([['p', orgEvent.pubkey]])
}

//-- this is deprecated
//add mention in content, using NIP-27, only support @profile now
export async function addMentionProfile(
    event: BaseEvent,
    insertPosition: number,
    pubkeyRaw: string,
    relays?: string[],
) {
    const nprofile = 'nostr:' + nip19.nprofileEncode({ pubkey: pubkeyRaw, relays: relays })
    event.content = event.content.slice(0, insertPosition) + ' ' + nprofile + ' ' + event.content.slice(insertPosition)
    event.tags.push(['p', pubkeyRaw, '', 'mention'])
}

/**
badge definition example:
        tags: [
            ['d', 'Public Sponsor'],
            ['name', 'Medal of Bravery'],
            ['description', 'Awarded to users demonstrating bravery'],
            ['image', 'https://nostr.academy/awards/bravery.png', '1024x1024'],
            ['thumb', 'https://nostr.academy/awards/bravery_256x256.png', '256x256'],
            ['thumb', 'https://nostr.academy/awards/bravery_128x128.png',  '128x128'],
        ],
 */
export async function toBadgeDefinition(
    event: BaseEvent,
    def: string, //unique name
    name: string, //short name,
    description: string,
    image: [string, string, string],
    thumb: [string, string, string][],
) {
    event.kind = KnownEventKind.BADGE_DEFINATION
    event.tags.push(['d', def])
    event.tags.push(['name', name])
    event.tags.push(['description', description])
    event.tags.push(image)
    for (const t of thumb) {
        event.tags.push(t)
    }
}

export async function toBadgeAward(
    event: BaseEvent,
    badgeIssuerPubkeyRaw: string,
    def: string,
    recipients: [p: string, pubkeyRaw: string, mainRelay?: string][],
) {
    event.kind = KnownEventKind.BDADE_REWARD
    event.tags.push(['a', '' + KnownEventKind.BDADE_REWARD + ':' + badgeIssuerPubkeyRaw + ':' + def])
    for (const r of recipients) {
        const arr: string[] = []
        arr.push('p')
        arr.push(r[1])
        if (r[2]) arr.push(r[2])
        event.tags.push(arr)
    }
}

export type BadgeProof = {
    def: string
    issuerPubkeyRaw: string
    issueEvent: string
    mainRelay: string //default as ''
}

export async function toBadgeProfile(event: BaseEvent, proofs: BadgeProof[]) {
    event.kind = KnownEventKind.BADGE_PROFILE
    event.tags.push(['d', 'profile_badges'])
    for (const proof of proofs) {
        event.tags.push(['a', '' + KnownEventKind.BADGE_PROFILE + ':' + proof.issuerPubkeyRaw + ':' + proof.def])
        event.tags.push(['e', proof.issueEvent, proof.mainRelay])
    }
}
