import { BaseEvent, EventFinalized } from 'src/core/event/Event';
import { contacts, relayInfo } from 'src/core/event/EventBuilder';
type relay = {
    url: string;
    read: boolean;
    write: boolean;
};
type contact = {
    pubkeyRaw: string;
    mainRelay?: string;
    petname?: string;
};
export default class Contact {
    relays: relay[];
    contacts: contact[];
    lastUpdatedAt: number;
    constructor(relays: relayInfo, contacts: contacts, lastUpdatedAt: number);
    static from(event: EventFinalized): Contact;
    toUnsignedEvent(): BaseEvent;
}
export {};
