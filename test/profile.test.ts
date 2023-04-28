// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch')
global.fetch = fetch as any
import Profile from 'src/model/Profile'

const someonesProfile = {
    content:
        '{"banner":"https://pbs.twimg.com/profile_banners/1615811983969816592/1675867539/1500x500","website":"https://plebstr.com","lud16":"elasticdrama39@walletofsatoshi.com","nip05":"mates@plebstr.com","picture":"https://pbs.twimg.com/profile_images/1370010573870612487/h_0OiKoC_400x400.jpg","display_name":"Mates","about":"Founder of Nostr client Plebstr.com \\n(previously Tweetoshi.com )\\n\\n#Pleb 🤙","name":"mates"}',
    created_at: 1682263822,
    id: '83e1d6389f78208eacf6d3fd3acad4ca4c82291dfbdaee9151af346a521a63cd',
    kind: 0,
    pubkey: 'eaf1a13a032ce649bc60f290a000531c4d525f6a7a28f74326972c4438682f56',
    sig: 'eef98ec86be28e3c3032e1cb9cf6fc6d6e9a65ae6f3acb9152c47547a817af128b53436998f9d3bd11e7bb94fabb8c96a9400697de4008fec78c2be7c0f1c7ad',
    tags: [],
}

test('parse profile event', async () => {
    const profile = Profile.from(someonesProfile)
    expect(await profile.isNip05Verified()).toBe(true)
})
