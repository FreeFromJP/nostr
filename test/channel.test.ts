import { Kind } from 'nostr-tools'
import { now } from 'src/core/utils/Misc'
import Channel from 'src/model/Channel'

import { settings } from '../testHelper/settings'

describe('Channel', () => {
    it('should return a channel', () => {
        const t = now()

        const channel = new Channel({
            name: 'channel name',
            about: 'channel about',
            picture: 'https://example.com/picture.png',
            creator: settings.pubkey,
            extra: {
                customField1: 'custom value 1',
                customField2: 'custom value 2',
            },
        })

        expect(channel).toEqual({
            name: 'channel name',
            about: 'channel about',
            picture: 'https://example.com/picture.png',
            creator: settings.pubkey,
            extra: {
                customField1: 'custom value 1',
                customField2: 'custom value 2',
            },
            id: '',
            relay: '',
            lastUpdatedAt: t,
        })
    })

    it('should parse a kind-40 event', () => {
        const event = {
            content:
                '{"name":"Tollgate Trash","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 1"}',
            created_at: 1683086165,
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            kind: 40,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '9ab864f24dbab8082740e051a6e26ee1225dc213cb62e639d0becdc2b4a6c3e377f4e65b982626f4accafd145b9049b79f62ca4d4182cb0266457271257f1056',
            tags: [],
        }
        const channel = Channel.from(event)

        expect(channel).toEqual({
            name: 'Tollgate Trash',
            about: 'Official Tollgate Trash Channel',
            picture: 'https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg',
            creator: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            extra: {
                customField1: 'custom value 1',
            },
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            relay: '',
            lastUpdatedAt: 1683086165,
        })
    })

    it('should parse a kind-40 event with mulit kind-41 events', () => {
        const event = {
            content:
                '{"name":"Tollgate Trash","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 1"}',
            created_at: 1683086165,
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            kind: 40,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '9ab864f24dbab8082740e051a6e26ee1225dc213cb62e639d0becdc2b4a6c3e377f4e65b982626f4accafd145b9049b79f62ca4d4182cb0266457271257f1056',
            tags: [],
        }
        const event41 = {
            content:
                '{"name":"Tollgate","about":"Official Tollgate Trash ","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 11", "customField2":"custom value 2"}',
            created_at: 1683086181,
            id: '03278f31149bdd9f82c6f47b7a0b1f1b9f48667c306ccccc88724b5ba957dd8d',
            kind: 41,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '7911a05108eed40888e4390b9ac338db45d4f6228e3109fa26baae0e463410ca853185fe8b0204bd6bcde205538ad5f0d65f17793f1932a3f1ee94abe4b09da8',
            tags: [['e', '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f', 'wss://relay.damus.io/']],
        }
        const event41_2 = {
            content:
                '{"name":"Tollgate","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 11", "customField3":"custom value 3"}',
            created_at: 1683086281,
            id: '91ecca37c0de78bf8604545fd16e4de4a6976fc4a0392447e159f888f29bafef',
            kind: 41,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '0a48d33788d0ca0881c3f8b2fa7143bee9cb74fdff9401509fa37f071430c194634bf94e3b958f3603208fb1d884da069c38e7a703fb9ad1f641af6cdcb0826c',
            tags: [['e', '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f', 'wss://relay.damus.io/']],
        }

        const channel = Channel.from(event, [event41, event41_2])

        expect(channel).toEqual({
            name: 'Tollgate',
            about: 'Official Tollgate Trash Channel',
            picture: 'https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg',
            creator: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            extra: {
                customField1: 'custom value 11',
                customField3: 'custom value 3',
            },
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            relay: 'wss://relay.damus.io/',
            lastUpdatedAt: 1683086281,
        })
    })
    it('should parse a kind-40 event with kind-41 event', () => {
        const event = {
            content:
                '{"name":"Tollgate Trash","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 1"}',
            created_at: 1683086165,
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            kind: 40,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '9ab864f24dbab8082740e051a6e26ee1225dc213cb62e639d0becdc2b4a6c3e377f4e65b982626f4accafd145b9049b79f62ca4d4182cb0266457271257f1056',
            tags: [],
        }
        const event41 = {
            content:
                '{"name":"Tollgate","about":"Official Tollgate Trash ","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 11", "customField2":"custom value 2"}',
            created_at: 1683086181,
            id: '03278f31149bdd9f82c6f47b7a0b1f1b9f48667c306ccccc88724b5ba957dd8d',
            kind: 41,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '7911a05108eed40888e4390b9ac338db45d4f6228e3109fa26baae0e463410ca853185fe8b0204bd6bcde205538ad5f0d65f17793f1932a3f1ee94abe4b09da8',
            tags: [['e', '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f', 'wss://relay.damus.io/']],
        }

        const channel = Channel.from(event, [event41])

        expect(channel).toEqual({
            name: 'Tollgate',
            about: 'Official Tollgate Trash ',
            picture: 'https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg',
            creator: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            extra: {
                customField1: 'custom value 11',
                customField2: 'custom value 2',
            },
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            relay: 'wss://relay.damus.io/',
            lastUpdatedAt: 1683086181,
        })
    })

    it('should return a unsigned kind-40 event without id', () => {
        const t = now()

        const channel = new Channel({
            name: 'channel name',
            about: 'channel about',
            picture: 'https://example.com/picture.png',
            creator: settings.pubkey,
            extra: {
                customField1: 'custom value 1',
                customField2: 'custom value 2',
            },
        })
        const event = channel.toUnsignedEvent()

        expect(event).toEqual({
            kind: Kind.ChannelCreation,
            tags: [],
            content:
                '{"name":"channel name","about":"channel about","picture":"https://example.com/picture.png","customField1":"custom value 1","customField2":"custom value 2"}',
            created_at: t,
            pubkey: '',
            id: '',
            sig: '',
        })
    })
    it('should return a unsigned kind-41 event with id', () => {
        const eventRaw = {
            content:
                '{"name":"Tollgate Trash","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 1"}',
            created_at: 1683086165,
            id: '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f',
            kind: 40,
            pubkey: '87cf5c480fa7f790c95e8b5e8a8a6ea13e2c3cbc30336138b4cf81396774977d',
            sig: '9ab864f24dbab8082740e051a6e26ee1225dc213cb62e639d0becdc2b4a6c3e377f4e65b982626f4accafd145b9049b79f62ca4d4182cb0266457271257f1056',
            tags: [],
        }

        const channel = Channel.from(eventRaw)
        const t = now()
        const event = channel.toUnsignedEvent()

        expect(event).toEqual({
            kind: Kind.ChannelMetadata,
            tags: [['e', '63c1188818334b226fb62fb9a2212b5a89147b3feac2a96ce7633089f7e8517f', '']],
            content:
                '{"name":"Tollgate Trash","about":"Official Tollgate Trash Channel","picture":"https://lirp.cdn-website.com/20ea998c/dms3rep/multi/opt/Logo1White-420w.jpg","customField1":"custom value 1"}',
            created_at: t,
            pubkey: '',
            id: '',
            sig: '',
        })
    })
})
