import { Keys } from 'src/core/account/Keys'
import { Event, EventOpts } from 'src/core/event/Event'
import { settings } from './settings'
import { pushEvent } from './utils'


const Opts1: EventOpts = {
    pubkey: settings.pubkey,
    kind: 1,
    content: 'Test Post: 8'
}

const event = new Event(Opts1)

// test('Test event hash', () => {
//     expect(event.hash()).toBe('12ce9c50fcdbe56c234d1cf6475aab4a4fcf422b1d7e6baa11f47d689047c130')
// })

test('Test event sig', () => {
    const keys = new Keys(settings.privkeyEncoded)
    event.signByKey(keys)
    console.log(event)
    expect(event.validate()).toBe(true)
})

test('Test event publish', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    event.signByKey(keys)
    console.log(event)
    await pushEvent(event)
})


