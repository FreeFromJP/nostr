import { KnownEventKind, Event } from './Event'

//kind-0 metadata
export interface MetaOpts {
    name: string,
    display_name?: string,
    picture?: string,
    banner?: string,
    about?: string,
    website?: string,
    nip05?: string,
    lud06?: string,
}

export function toMetadata(event: Event, metadata: MetaOpts){
    event.kind = KnownEventKind.METADATA
    event.content = JSON.stringify(metadata)
}

//kind-1 short text note
export function toNote(event: Event, content: string) {
    event.kind = KnownEventKind.NOTE
    event.content = content
}

