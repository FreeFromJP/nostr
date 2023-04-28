import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { toNote } from 'src/core/event/EventBuilder'

import { settings } from '../testHelper/settings'
import { pushEvent } from '../testHelper/utils'

test('Test send note', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    await event.modify(toNote, 'I am counting: 1')
    event.signByKey(keys)
    await pushEvent(event)
})
