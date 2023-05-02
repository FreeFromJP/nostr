import { Filter } from 'nostr-tools'
import Note from 'src/model/Note'

import { decodeKey } from '../core/account/Keys'
import { KnownEventKind } from '../core/event/Event'
import Contact from '../model/Contact'
import Profile from '../model/Profile'
import NostrClient from './NostrClient'

export async function fetchProfiles(client: NostrClient, pubkeys: string[]): Promise<{ [pubkey: string]: Profile }> {
    const filter: Filter = {
        kinds: [KnownEventKind.METADATA],
        authors: pubkeys.map((k) => decodeKey(k)),
    }

    const results = await client.fetch([filter])

    const profileUnchecked = results.map((x) => Profile.from(x) as Profile)
    const collections: { [pubkey: string]: Profile } = {}
    profileUnchecked.forEach((p) => {
        if (collections[p.pubkey] == undefined) {
            collections[p.pubkey] = p
        } else {
            collections[p.pubkey] = collections[p.pubkey].lastUpdatedAt > p.lastUpdatedAt ? collections[p.pubkey] : p
        }
    })
    return collections
}

export async function fetchContact(client: NostrClient, pubkeyRaw: string): Promise<Contact | null> {
    const filter: Filter = {
        kinds: [KnownEventKind.CONTACT],
        authors: [pubkeyRaw],
    }
    const results = await client.fetch([filter])
    if (results.length == 0) return null
    if (results.length == 1) return Contact.from(results[0])
    const latest = results.reduce((a, b) => (a.created_at > b.created_at ? a : b))
    return Contact.from(latest)
}

export async function fetchNotes(client: NostrClient, ids: string[]): Promise<Note[]> {
    const filter = {
        kinds: [1],
        ids: ids,
    }
    const results = await client.fetch([filter])
    return results.map((n) => new Note(n))
}

export async function fetchRepliesOrdered(
    client: NostrClient,
    root_id: string,
    limit = 500,
    until?: number,
): Promise<Note[]> {
    const filter: Filter = {
        kinds: [1],
        '#e': [root_id],
        limit: limit,
    }
    if (until) {
        filter.until = until
    }
    const results = await client.fetch([filter])
    if (results.length == 0) return []
    return results.sort((a, b) => a.created_at - b.created_at).map((n) => new Note(n))
}
