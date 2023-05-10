import { BaseEvent, EventFinalized, KnownEventKind } from 'src/core/event/Event'
import { Contacts, RelayInfo, toContact } from 'src/core/event/EventBuilder'

type relay = {
    url: string
    read: boolean
    write: boolean
}

type contact = {
    pubkeyRaw: string
    mainRelay?: string
    petname?: string
}

export default class Contact {
    relays: relay[] = []
    contacts: contact[] = []
    lastUpdatedAt: number

    constructor(relays: RelayInfo, contacts: Contacts, lastUpdatedAt: number) {
        //map data
        for (const [key, item] of Object.entries(relays)) {
            this.relays.push({ url: key, read: item.read, write: item.write })
        }
        this.contacts = contacts.map((x) => ({
            pubkeyRaw: x[1],
            mainRelay: x[2] ? x[2] : '',
            petname: x[3] ? x[3] : '',
        }))
        this.lastUpdatedAt = lastUpdatedAt
    }

    static from(event: EventFinalized) {
        if (event.kind !== KnownEventKind.CONTACT) throw new Error('kind-3 event expected')
        let relays: RelayInfo = {}
        let contacts: Contacts = []
        const eventObj = new BaseEvent(event)
        try {
            //todo add checks
            try {
                relays = JSON.parse(event.content) as RelayInfo
            } catch (e) {
                //pass
            }
            if (event.tags.length > 0) {
                contacts = event.tags.filter((x) => x[0] === 'p') as Contacts
            }
        } catch (e) {
            throw new Error('parse contacts error')
        }
        return new Contact(relays, contacts, eventObj.created_at)
    }

    toUnsignedEvent(): BaseEvent {
        const event = new BaseEvent()
        const info: RelayInfo = {}
        this.relays.forEach((r) => {
            info[r.url] = { read: r.read, write: r.write }
        })
        const cons: Contacts = []
        this.contacts.forEach((c) => {
            cons.push(['p', c.pubkeyRaw, c.mainRelay, c.petname])
        })
        event.modify(toContact, info, cons)
        return event
    }
}
