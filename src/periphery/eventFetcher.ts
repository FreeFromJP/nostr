import { Filter } from 'nostr-tools'

import Profile from '../model/Profile'
import NostrClient from './NostrClient'

export async function fetchProfiles(client: NostrClient, pubkeys: string[]) {
    const filter: Filter = {
        kinds: [0],
        authors: pubkeys,
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
