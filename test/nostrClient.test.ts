import NostrClient from 'src/periphery/NostrClient'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'

global.WebSocket = WebSocket as any

jest.useRealTimers()
describe('NostrClient', () => {
    const pool = new NostrClient(settings.relays)

    afterAll((done) => {
        pool.close()
        done()
    })

    it('fetch()', async () => {
        // const events = await pool.fetch([
        //     {
        //         authors: [settings.pubkey],
        //         kinds: [1],
        //         limit: 2,
        //     },
        // ])

        const events = await pool.fetch([
            {
                kinds: [0],
                authors: [
                    '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
                    '69dfcf1cf5be81090d9d95314ffb81e0230b9f569d350cb2babe608d4faaf3b0',
                ],
            },
        ])

        console.log('events:', events)
        console.log('event length:', events.length)

        // the actual received number will be greater than 2, but there will be no duplicates
        expect(events.length).toEqual(
            events.map((evt) => evt.id).reduce((acc, n) => (acc.indexOf(n) !== -1 ? acc : [...acc, n]), [] as string[])
                .length,
        )

        const relaysForAllEvents = events.map((event) => pool.seenOn(event.id)).reduce((acc, n) => acc.concat(n), [])
        expect(relaysForAllEvents.length).toBeGreaterThanOrEqual(events.length)
    })
})
