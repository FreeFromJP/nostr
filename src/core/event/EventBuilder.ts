import { Keys } from '../account/Keys'
import { BaseEvent, KnownEventKind } from './Event'

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

//kind-2 todo: recommend relay

//kind-3 contact, using nip-02 and conventional relays recording in content
export type relayInfo = { [url: string]: { read: boolean; write: boolean } }
export type contacts = [p: string, pubkeyRaw: string, mainRelay?: string, petname?: string][]

export async function toContact(event: BaseEvent, relays: relayInfo, contacts: contacts) {
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
    console.log(event)
    event.tags = tags
}

//kind-4 DM
export async function toDM(event: BaseEvent, keys: Keys, otherPubkeyRaw: string, plainText: string) {
    event.kind = KnownEventKind.DM
    event.content = await keys.encrypt(otherPubkeyRaw, plainText)
    event.tags = [['p', otherPubkeyRaw]]
}
