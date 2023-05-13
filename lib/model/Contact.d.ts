import { BaseEvent, EventFinalized } from '../core/event/Event';
import { Contacts, RelayInfo } from '../core/event/EventBuilder';
type RelayItem = {
    url: string;
    read: boolean;
    write: boolean;
};
type ContactItem = {
    pubkeyRaw: string;
    mainRelay?: string;
    petname?: string;
};
export default class Contact {
    relays: RelayItem[];
    contacts: ContactItem[];
    lastUpdatedAt: number;
    pubkeyRaw?: string;
    created_at: number;
    constructor(relays: RelayInfo, contacts: Contacts, lastUpdatedAt: number, pubkeyRaw?: string);
    static from(event: EventFinalized): Contact;
    toUnsignedEvent(): BaseEvent;
}
export {};
