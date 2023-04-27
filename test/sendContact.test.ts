import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { contacts, relayInfo, toContact } from 'src/core/event/EventBuilder'

import { settings } from '../testHelper/settings'
import { pushEvent } from '../testHelper/utils'

const relayInfo = {
    'wss://no.str.cr': { read: true, write: true },
    'wss://relay.snort.social': { read: true, write: true },
    'wss://relay.damus.io': { read: true, write: true },
    'wss://nostr.bitcoiner.social': { read: true, write: true },
    'wss://relay.nostr.bg': { read: true, write: true },
    'wss://nostr.oxtr.dev': { read: true, write: true },
    'wss://nostr-pub.wellorder.net': { read: true, write: true },
    'wss://nostr.mom': { read: true, write: true },
    'wss://nos.lol': { read: true, write: true },
    'wss://relay.nostr.com.au': { read: true, write: false },
    'wss://eden.nostr.land': { read: true, write: false },
    'wss://nostr.milou.lol': { read: true, write: false },
    'wss://puravida.nostr.land': { read: true, write: false },
    'wss://nostr.wine': { read: true, write: false },
    'wss://nostr.inosta.cc': { read: true, write: false },
    'wss://atlas.nostr.land': { read: true, write: false },
    'wss://relay.orangepill.dev': { read: true, write: false },
    'wss://relay.nostrati.com': { read: true, write: false },
    'wss://relay.nostr.band': { read: true, write: false },
}
const contacts = [
    ['p', '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'],
    ['p', '69dfcf1cf5be81090d9d95314ffb81e0230b9f569d350cb2babe608d4faaf3b0'],
    ['p', '498e954bcd0c26e46fc3bcc79ec422df277b6db728d6a3439fe7fcc0a4b97c4e', 'wss://relay.damus.io', 'wall2'],
]

test('Test contact', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    await event.modify(toContact, relayInfo, contacts)
    event.signByKey(keys)
    console.log(event)
    await pushEvent(event)
})
