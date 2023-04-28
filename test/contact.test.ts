import Contact from 'src/model/Contact'

const someonesContact = {
    id: 'd45134fbb48ec578537da07458aead58e3946d95e6e635cc14c97f6242fb675c',
    kind: 3,
    pubkey: 'f7c1fb977450392671ab594f355f28c393c7b45594b0df61dab208cd6f7a75e3',
    created_at: 1682577335,
    content:
        '{"wss://no.str.cr":{"read":true,"write":true},"wss://relay.snort.social":{"read":true,"write":true},"wss://relay.damus.io":{"read":true,"write":true},"wss://nostr.bitcoiner.social":{"read":true,"write":true},"wss://relay.nostr.bg":{"read":true,"write":true},"wss://nostr.oxtr.dev":{"read":true,"write":true},"wss://nostr-pub.wellorder.net":{"read":true,"write":true},"wss://nostr.mom":{"read":true,"write":true},"wss://nos.lol":{"read":true,"write":true},"wss://relay.nostr.com.au":{"read":true,"write":false},"wss://eden.nostr.land":{"read":true,"write":false},"wss://nostr.milou.lol":{"read":true,"write":false},"wss://puravida.nostr.land":{"read":true,"write":false},"wss://nostr.wine":{"read":true,"write":false},"wss://nostr.inosta.cc":{"read":true,"write":false},"wss://atlas.nostr.land":{"read":true,"write":false},"wss://relay.orangepill.dev":{"read":true,"write":false},"wss://relay.nostrati.com":{"read":true,"write":false},"wss://relay.nostr.band":{"read":true,"write":false}}',
    tags: [
        ['p', '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'],
        ['p', '69dfcf1cf5be81090d9d95314ffb81e0230b9f569d350cb2babe608d4faaf3b0'],
        ['p', '498e954bcd0c26e46fc3bcc79ec422df277b6db728d6a3439fe7fcc0a4b97c4e', 'wss://relay.damus.io', 'wall'],
    ],
    sig: '77707147293090afd3e79716164302600ee64f2d91632c31e0fa08846d13f885471d6b5184b503c67f9cffe6944ac76c568158a1672ff7a55e0a297f2f9d71e3',
}

test('parse profile event', async () => {
    const contact = Contact.from(someonesContact)
    expect(contact.contacts.length).toBe(3)
})
