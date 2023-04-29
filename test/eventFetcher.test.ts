import { NostrClient } from 'src/index'
import { fetchProfiles } from 'src/periphery/eventFetcher'

import { settings } from '../testHelper/settings'

const client = new NostrClient(settings.relays)
const pubkeys = [
    'npub1d80u7884h6qsjrvaj5c5l7upuq3sh86kn56sev46hesg6na27wcq62tflx',
    'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s',
]
test('Test fetch profiles', async () => {
    const results = await fetchProfiles(client, pubkeys)
    console.log(results)
    expect(results.length).toBe(pubkeys.length)
})
