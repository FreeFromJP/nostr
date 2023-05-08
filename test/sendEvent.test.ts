import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import {
    addMentionProfile,
    contacts,
    relayInfo,
    toContact,
    toDM,
    toMetadata,
    toNote,
} from 'src/core/event/EventBuilder'
import { MetaOpts } from 'src/core/event/EventBuilder'
import { toReaction, toRepost } from 'src/core/event/EventBuilder'
import { now } from 'src/core/utils/Misc'
import { NostrClient, Profile } from 'src/index'
import { Contact } from 'src/index'
import Note from 'src/model/Note'

import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'

test('Test send DM', async () => {
    const otherPubkeyRaw = '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'
    const client = new NostrClient(settings.relays)
    const event = new BaseEvent()
    const keys = new Keys(settings.privkeyEncoded)
    await event.modify(toDM, keys, otherPubkeyRaw, 'hello: 9')
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

const meta: MetaOpts = {
    name: 'The God Emperor 4',
    display_name: 'The God Emperor',
    picture:
        'https://boredmummy.mypinata.cloud/ipfs/QmRiseEviB3gWSFC4cDbC2yp94UzvKKr24vNM3KzWFEHR9?_gl=1*zevgdj*_ga*NDY0ODUxNTQ3LjE2Njg5MTYzMzc.*_ga_5RMPXG14TE*MTY3Nzc0NTcxOC43LjEuMTY3Nzc0NTcyMi41Ni4wLjA.',
    about: 'The lord of human kind',
}

//using toContact directly is deprecated, you can use Contact.toUnsignedEvent() instead
test('Test send profile', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
    await event.modify(toMetadata, meta)
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test send profile by model', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const profile = new Profile(settings.privkeyEncoded, { name: 'Sleepy Doge' }, now())
    profile.about = 'a lazy doge'
    const event = profile.toUnsignedEvent()
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test send note', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
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

//using toContact directly is deprecated, you can use Contact.toUnsignedEvent() instead
test('Test contact', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
    await event.modify(toContact, relayInfo, contacts)
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test contact by model', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const contact = new Contact({}, [], now())
    contact.relays.push({ url: 'wss://relay.nostr.band', read: true, write: true })
    contact.contacts.push({
        pubkeyRaw: '498e954bcd0c26e46fc3bcc79ec422df277b6db728d6a3439fe7fcc0a4b97c4e',
        mainRelay: 'wss://relay.damus.io',
        petname: 'wall2',
    })
    const event = contact.toUnsignedEvent()
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

const rEvent = {
    pubkey: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
    content:
        'seems correct https://nostr.build/i/c8f7ed917b976101839ed349a5b078c91c3427dc1923416d7a048d81b4c6b74e.jpg ',
    id: '7ce68f2dcaf4febd7bba3238d3acb4ad1d156e4083eb624a694c35ef887f8821',
    created_at: 1682990572,
    sig: '76723d7eee040674000ef02dc30a294aa816ee8d7d49d93b206328069b08d69fddecd94272234fe5d400dea575031275ae7267780366cbb6cb0f65074de002c7',
    kind: 1,
    tags: [
        [
            'imeta',
            'url https://nostr.build/i/c8f7ed917b976101839ed349a5b078c91c3427dc1923416d7a048d81b4c6b74e.jpg',
            'blurhash e46*aa?bE0oyD%-;s;Rja{Rj9FWBt7Rjof%MozWBafRj00RjtQRjt7',
            'dim 1179x1473',
        ],
    ],
}

test('Test repost', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
    const repostTo = new Note(rEvent) //mimic the note already load in frontend
    await event.modify(toRepost, repostTo.finalized())
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test reaction', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
    const repostTo = new Note(rEvent)
    await event.modify(toReaction, repostTo.finalized(), '🐱')
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})

test('Test mention profile', async () => {
    const client = new NostrClient(settings.relays)
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent()
    event.modify(toNote, 'Testing, sorry to bother u: ')
    event.modify(addMentionProfile, 28, '5fd693e61a7969ecf5c11dbf5ce20aedac1cea71721755b037955994bf6061bb', [])
    event.signByKey(keys)
    await client.publish(event)
    await sleep(500)
    client.close()
})
