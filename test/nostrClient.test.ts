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
        const events = await pool.fetch([
            {
                authors: [settings.pubkey],
                kinds: [1],
                limit: 2,
            },
        ])

        // the actual received number will be greater than 2, but there will be no duplicates
        expect(events.length).toEqual(
            events.map((evt) => evt.id).reduce((acc, n) => (acc.indexOf(n) !== -1 ? acc : [...acc, n]), [] as string[])
                .length,
        )

        const relaysForAllEvents = events.map((event) => pool.seenOn(event.id)).reduce((acc, n) => acc.concat(n), [])
        expect(relaysForAllEvents.length).toBeGreaterThanOrEqual(events.length)
    })
})
