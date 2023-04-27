import 'websocket-polyfill'

import { Event, getEventHash, signEvent } from 'nostr-tools'
import { Relay } from 'src/core/relay/Relay'

import { settings } from '../testHelper/settings'

describe('Relay', () => {
    const relay = new Relay(settings.relays[0])

    beforeAll(() => {
        relay.connect()
    })

    afterAll(() => {
        relay.disconnect()
    })

    it('should connect in 5 seconds', (done) => {
        let i = 0
        const fn = () => {
            setTimeout(() => {
                i++
                const r = relay.isConnected()
                if (i > 5) {
                    done('timeout')
                    return
                }
                if (r) {
                    done()
                    return
                }
                fn()
            }, 1000)
        }

        fn()
    })

    it('should get event', async () => {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 2000)
        })
        let resolve1: (value: unknown) => void
        let resolve2: (value: unknown) => void
        const sub = relay.subscribe([
            {
                ids: ['0873445a6c0dec7eea0f88bbc4cca24c239eca00d7effeb65d3f02b2184fd22c'],
            },
        ])
        sub.on('event', (event) => {
            expect(event).toHaveProperty('id', '0873445a6c0dec7eea0f88bbc4cca24c239eca00d7effeb65d3f02b2184fd22c')
            resolve1(true)
        })
        sub.on('eose', () => {
            resolve2(true)
        })

        const [t1, t2] = await Promise.all([
            new Promise((resolve) => {
                resolve1 = resolve
            }),
            new Promise((resolve) => {
                resolve2 = resolve
            }),
        ])

        expect(t1).toEqual(true)
        expect(t2).toEqual(true)
    }, 5000)

    it('should publish event to relay', async () => {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 2000)
        })
        const event: Event = {
            kind: 1,
            pubkey: settings.pubkey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: 'publish event',
        } as unknown as Event
        event.id = getEventHash(event)
        event.sig = signEvent(event, settings.prikey)

        const result = await relay.publish(event)
        expect(result).toEqual(true)
    })
})
