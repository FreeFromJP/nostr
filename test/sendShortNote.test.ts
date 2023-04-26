import { Keys } from 'src/core/account/Keys'
import { BaseEvent } from 'src/core/event/Event'
import { toNote } from 'src/core/event/EventBuilder'

import { settings } from '../data/settings'
import { pushEvent } from '../data/utils'

test('Test send note', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    const event = new BaseEvent({})
    event.modify(toNote, 'This is your load speaking!!')
    event.signByKey(keys)
    console.log(event)
    await pushEvent(event)
})
