import { NostrClient } from 'src/index'
import { fetchFollowersAMAP } from 'src/periphery/eventFetcher'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'

global.WebSocket = WebSocket as any

// test('Test fetch profiles', async () => {
//     const client = new NostrClient(settings.relays)
//     const pubkeys = ['npub1kurad0nlm8xfuxhws05pcwv5z4k0ea6da4dsjygexr77a666pssqsftsm7']
//     const results = await fetchProfiles(client, pubkeys)
//     console.log(results, Object.keys(results).length)
//     client.close()
//     expect(pubkeys.length).toBe(Object.keys(results).length)
// })

// test('Test fetch contact', async () => {
//     const client = new NostrClient(settings.relays)
//     const results = await fetchContact(client, '8e9595d0e0d6b29ed24fe4a71ff7f0e0829e3b8c080ffb27b47e56bee9baa26b')
//     console.log(results)
//     client.close()
// })

test('Test fetch contacts like me', async () => {
    const client = new NostrClient(settings.relays)
    const set = new Set<string>()
    const results = await fetchFollowersAMAP(
        client,
        '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb',
        (contacts) => {
            console.log(contacts.length)
            contacts.forEach((x) => {
                set.add(x.pubkeyRaw as string)
            })
        },
        1, //recommend 3
        // recmmend null
    )

    console.log('length added up:', results.length)

    for (const r of results) {
        set.add(r.pubkeyRaw as string)
    }
    console.log('actual record:', set.size)
    client.close()
}, 5000000)
