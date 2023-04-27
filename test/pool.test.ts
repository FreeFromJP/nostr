import { Keys } from 'src/core/account/Keys'
import { BaseEvent, Event } from 'src/core/event/Event'
import ReplayPool from 'src/core/relay/Pool'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.WebSocket = WebSocket

const Opts1: Event = {
    pubkey: settings.pubkey,
    kind: 1,
    content: 'Test Post: 103',
}

const event = new BaseEvent(Opts1)
const keys = new Keys(settings.privkeyEncoded)
event.signByKey(keys)

test('Test init relay pool', async () => {
    const pool = new ReplayPool(settings.relays)
    pool.connect()
    await sleep(2000)
    await pool.publish(event)
    pool.disconnect()
})
