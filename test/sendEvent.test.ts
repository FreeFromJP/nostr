import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { contacts, relayInfo, toContact, toDM, toMetadata, toNote } from 'src/core/event/EventBuilder'
import { MetaOpts } from 'src/core/event/EventBuilder'
import { NostrClient } from 'src/index'

import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'

const otherPubkeyRaw = '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'

const keys = new Keys(settings.privkeyEncoded)

test('Test send note', async () => {
    const client = new NostrClient(settings.relays)
    const event = new BaseEvent({})
    await event.modify(toDM, keys, otherPubkeyRaw, 'hello: 9')
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

const meta: MetaOpts = {
    name: 'The God Emperor 2',
    display_name: 'The God Emperor',
    picture:
        'https://boredmummy.mypinata.cloud/ipfs/QmRiseEviB3gWSFC4cDbC2yp94UzvKKr24vNM3KzWFEHR9?_gl=1*zevgdj*_ga*NDY0ODUxNTQ3LjE2Njg5MTYzMzc.*_ga_5RMPXG14TE*MTY3Nzc0NTcxOC43LjEuMTY3Nzc0NTcyMi41Ni4wLjA.',
    about: 'The lord of human kind',
}

test('Test send profile', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    await event.modify(toMetadata, meta)
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test send note', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    await event.modify(toNote, 'I am counting: 1')
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

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
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    await event.modify(toContact, relayInfo, contacts)
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})
