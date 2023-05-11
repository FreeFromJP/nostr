import { BaseEvent, EventFinalized } from '../core/event/Event';
import { Contacts, RelayInfo } from '../core/event/EventBuilder';
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
    constructor(relays: RelayInfo, contacts: Contacts, lastUpdatedAt: number);
    static from(event: EventFinalized): Contact;
    toUnsignedEvent(): BaseEvent;
}
export {};
