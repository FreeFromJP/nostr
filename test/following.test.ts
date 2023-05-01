import { BaseEvent } from 'src/index'
import { toNote } from 'src/index'
import Following from 'src/periphery/Following'
import NostrClient from 'src/periphery/NostrClient'
import WebSocket from 'ws'

import { Keys } from '../src/core/account/Keys'
import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'

global.WebSocket = WebSocket as any

const keysToFollow = [
    'npub17lqlh9m52qujvudtt98n2hegcwfu0dz4jjcd7cw6kgyv6mm6wh3sg2mynq',
    'npub1d9sak6hvqke84gwm9zukkqfsu6q9cdt7gltnz5e7cjkf0e0uh6assm3h6s',
]

const keys = new Keys(settings.privkeyEncoded)

// test('Test fetch notes', async () => {
//     const client = new NostrClient(settings.relays)
//     const follow = new Following(keysToFollow)
//     await follow.digging(client, 20, console.log)
//     client.close()
// })

test('Test digging the incoming notes', async () => {
    const client = new NostrClient(settings.relays)
    const follow = new Following(keysToFollow)
    follow.sub4Incoming(client, console.log)
    {
        const event = new BaseEvent()
        await event.modify(toNote, 'test for subscription: 9')
        event.signByKey(keys)
        await client.publish(event)
    }
    await sleep(20)
    {
        const event = new BaseEvent()
        await event.modify(toNote, 'test for subscription: 10')
        event.signByKey(keys)
        await client.publish(event)
    }
    await sleep(2000)

    client.close()
})
