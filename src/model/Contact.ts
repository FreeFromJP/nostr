import { BaseEvent, EventFinalized, KnownEventKind } from 'src/core/event/Event'
import { contacts, relayInfo, toContact } from 'src/core/event/EventBuilder'

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

    constructor(relays: relayInfo, contacts: contacts, lastUpdatedAt: number) {
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
        if (event.kind != KnownEventKind.CONTACT) throw new Error('kind-3 event expected')
        let relays: relayInfo
        let contacts: contacts = []
        const eventObj = new BaseEvent(event)
        try {
            //todo add checks
            relays = JSON.parse(event.content) as relayInfo
            if (event.tags.length > 0) {
                contacts = event.tags.filter((x) => x[0] == 'p') as contacts
            }
        } catch (e) {
            throw new Error('parse contacts error')
        }
        return new Contact(relays, contacts, eventObj.created_at)
    }

    toUnsignedEvent(): BaseEvent {
        const event = new BaseEvent()
        const info: relayInfo = {}
        this.relays.forEach((r) => {
            info[r.url] = { read: r.read, write: r.write }
        })
        const cons: contacts = []
        this.contacts.forEach((c) => {
            cons.push(['p', c.pubkeyRaw, c.mainRelay, c.petname])
        })
        event.modify(toContact)
        return event
    }
}
