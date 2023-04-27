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

export function toMetadata(event: BaseEvent, metadata: MetaOpts) {
    event.kind = KnownEventKind.METADATA
    event.content = JSON.stringify(metadata)
}

//kind-1 short text note
export function toNote(event: BaseEvent, content: string) {
    event.kind = KnownEventKind.NOTE
    event.content = content
}

//kind-3 contact, using nip-02 and conventional relays recording in content
export type relayInfo = { [url: string]: { read: boolean; write: boolean } }
export type contacts = [p: string, pubkeyRaw: string, mainRelay?: string, petname?: string][]

export function toContact(event: BaseEvent, relays: relayInfo, contacts: contacts) {
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
