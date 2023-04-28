import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { toDM } from 'src/core/event/EventBuilder'

import { settings } from '../testHelper/settings'
import { pushEventByPool as pushEvent } from '../testHelper/utils'

const otherPubkeyRaw = '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'

import crtpto from 'crypto'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.crypto = crtpto

const keys = new Keys(settings.privkeyEncoded)

test('Test send note', async () => {
    const event = new BaseEvent({})
    await event.modify(toDM, keys, otherPubkeyRaw, 'hello: 3')
    event.signByKey(keys)
    await pushEvent(event)
})
