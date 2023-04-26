import { Keys } from 'src/core/account/Keys'
import { Event } from 'src/core/event/Event'
import { toNote } from 'src/core/event/EventBuilder'
import { settings } from './settings'
import { pushEvent } from './utils'


test('Test send note', async () => {
    const keys = new Keys(settings.privkeyEncoded)
    const event = new Event({})
    event.modify(toNote, "This is your load speaking!!")
    event.signByKey(keys)
    console.log(event)
    await pushEvent(event)
})

