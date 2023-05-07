import { DirectMessage, EncryptedDirectMessage, Keys, NostrClient } from 'src/index'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'

global.WebSocket = WebSocket as any

describe('DirectMessage', () => {
    const pool = new NostrClient(settings.relays)
    const authorKeys = new Keys(settings.privkeyEncoded2)
    const rescipients = settings.pubkey

    afterAll(() => {
        pool.close()
    })

    it('should subscribe direct message', async () => {
        const dm = new DirectMessage({
            keys: authorKeys,
        })

        const received: any[] = []

        dm.subscribe(
            pool,
            (e) => {
                received.push(e)
            },
            {
                limit: 0,
            },
        )

        const edm = new EncryptedDirectMessage({
            recipients: rescipients,
            plaintext: 'hello world 2',
        })
        await edm.encryptContent(authorKeys)
        edm.signByKey(authorKeys)
        const event = edm.finalized()

        await pool.publish(event)

        await sleep(2000)

        expect(received).toHaveLength(1)
    })

    it('should fetch history', async () => {
        const dm = new DirectMessage({
            keys: authorKeys,
        })

        const received = await dm.history(pool, {
            rescipients: rescipients,
            limit: 2,
        })

        expect(received.length).toEqual(
            received
                .map((evt) => evt.id)
                .reduce((acc, n) => (acc.indexOf(n) !== -1 ? acc : [...acc, n]), [] as string[]).length,
        )

        const relaysForAllEvents = received.map((event) => pool.seenOn(event.id)).reduce((acc, n) => acc.concat(n), [])
        expect(relaysForAllEvents.length).toBeGreaterThanOrEqual(received.length)
    })
})
