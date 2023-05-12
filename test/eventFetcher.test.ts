import fs from 'fs'
import { NostrClient } from 'src/index'
import { fetchFollowersAMAP } from 'src/periphery/eventFetcher'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'

global.WebSocket = WebSocket as any

// test('Test fetch profiles', async () => {
//     const client = new NostrClient(settings.relays)
//     const pubkeys = [
//         'npub1d80u7884h6qsjrvaj5c5l7upuq3sh86kn56sev46hesg6na27wcq62tflx',
//         'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s',
//     ]
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
        '3efdaebb1d8923ebd99c9e7ace3b4194ab45512e2be79c1b7d68d9243e0d2681',
        (contacts) => {
            console.log(contacts.length)
            contacts.forEach((x) => {
                set.add(x.pubkeyRaw as string)
            })
        },
        50, //recommend 3
        1000, // recmmend null
    )

    console.log('length added up:', results.length)

    for (const r of results) {
        set.add(r.pubkeyRaw as string)
    }
    console.log('actual record:', set.size)
    client.close()
    fs.writeFileSync('./test.test', JSON.stringify(Array.from(set)))
}, 5000000)
