import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { toMetadata, MetaOpts } from 'src/core/event/EventBuilder'
import { settings } from './settings'
import { pushEvent } from './utils'


const meta: MetaOpts = {
    name: "The God Emperor",
    display_name: "The God Emperor",
    picture: "https://boredmummy.mypinata.cloud/ipfs/QmRiseEviB3gWSFC4cDbC2yp94UzvKKr24vNM3KzWFEHR9?_gl=1*zevgdj*_ga*NDY0ODUxNTQ3LjE2Njg5MTYzMzc.*_ga_5RMPXG14TE*MTY3Nzc0NTcxOC43LjEuMTY3Nzc0NTcyMi41Ni4wLjA.",
    about: "The lord of human kind"
}

test('Test send profile', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    event.modify(toMetadata, meta)
    event.signByKey(keys)
    console.log(event)
    await pushEvent(event)
})

