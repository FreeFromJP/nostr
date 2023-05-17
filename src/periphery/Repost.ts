import { Filter } from 'nostr-tools'

import { BaseEvent, EventFinalized } from '../core/event/Event'
import Note from '../model/Note'
import NostrClient from '../periphery/NostrClient'

//we place the class here instead in model because it may have fetch requests
export default class Repost extends BaseEvent {
    orgNote?: Note //embed or not

    constructor(event: EventFinalized) {
        super(event)
        try {
            const event = JSON.parse(this.content) as EventFinalized
            if (event.kind === 1) {
                this.orgNote = new Note(event)
            }
        } catch (e) {
            //do nothing
        }
    }

    //deal with empty content
    async loadOrgNote(client: NostrClient) {
        if (this.orgNote) return
        try {
            const orgEventId = this.tags.filter((t) => t[0] === 'e')[0][1] //get the first e
            const filter: Filter = {
                ids: [orgEventId],
                limit: 1,
            }
            const result = await client.get(filter)
            if (!result || result.kind !== 1) return
            this.orgNote = new Note(result)
        } catch (e) {
            throw new Error('Error fetching original event of this repost')
        }
    }
}
