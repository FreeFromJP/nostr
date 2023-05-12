import { Filter } from 'nostr-tools'
import { now } from 'src/core/utils/Misc'

import { decodeKey } from '../core/account/Keys'
import { EventFinalized, KnownEventKind } from '../core/event/Event'
import Contact from '../model/Contact'
import Note from '../model/Note'
import Profile from '../model/Profile'
import { sortAsc } from './Alignment'
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
        if (collections[p.pubkey] === undefined) {
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
    if (results.length === 0) return null
    if (results.length === 1) return Contact.from(results[0])
    const latest = results.reduce((a, b) => (a.created_at > b.created_at ? a : b))
    return Contact.from(latest)
}

export async function fetchNotes(client: NostrClient, ids: string[]): Promise<Note[]> {
    const filter = {
        kinds: [KnownEventKind.NOTE],
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
        kinds: [KnownEventKind.NOTE],
        '#e': [root_id],
        limit: limit,
    }
    if (until) {
        filter.until = until
    }
    const results = await client.fetch([filter])
    if (results.length === 0) return []
    return results.sort((a, b) => a.created_at - b.created_at).map((n) => new Note(n))
}

//there is no need to create a model for repost
export async function fetchReposts(client: NostrClient, eventId: string): Promise<EventFinalized[]> {
    const filter: Filter = {
        kinds: [KnownEventKind.REPOST],
        '#e': [eventId],
    }
    return await client.fetch([filter])
}

//there is no need to create a model for reaction
export async function fetchReactions(client: NostrClient, eventId: string): Promise<EventFinalized[]> {
    const filter: Filter = {
        kinds: [KnownEventKind.REACTION],
        '#e': [eventId],
    }
    return await client.fetch([filter])
}

export async function fetchFollowers(
    client: NostrClient,
    pubkeyRaw: string,
    until?: number,
    limit?: number,
): Promise<Contact[]> {
    const filter: Filter = {
        kinds: [KnownEventKind.CONTACT],
        '#p': [pubkeyRaw],
    }
    if (until) filter.until = until
    if (limit) filter.limit = limit
    const results = await client.fetch([filter])
    return results.map((c) => Contact.from(c))
}

export async function fetchFollowersAMAP(
    client: NostrClient,
    pubkeyRaw: string,
    cb: (contracts: Contact[]) => void,
    maxFetch = 3,
    eachBatch?: number,
): Promise<Contact[]> {
    let fetchCount = 0
    let numberAdded = 0
    let totalContacts: Contact[] = []
    let until = now()
    do {
        let results: Contact[]
        if (eachBatch) {
            results = sortAsc(await fetchFollowers(client, pubkeyRaw, until, eachBatch)) as Contact[]
        } else {
            results = sortAsc(await fetchFollowers(client, pubkeyRaw, until)) as Contact[]
        }
        numberAdded = results.length
        if (numberAdded === 0) break
        totalContacts = results.concat(totalContacts)
        fetchCount++
        until = results[0].created_at
        cb(results)
    } while (fetchCount < maxFetch && numberAdded > 0)
    return totalContacts
}
