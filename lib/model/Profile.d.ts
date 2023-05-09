import { BaseEvent, EventFinalized } from '../core/event/Event';
import { MetaOpts } from '../core/event/EventBuilder';
import Contact from './Contact';
export default class Profile {
    pubkey: string;
    name: string;
    display_name?: string;
    picture?: string;
    banner?: string;
    about?: string;
    website?: string;
    lud06?: string;
    lud16?: string;
    lastUpdatedAt: number;
    nip05?: {
        url?: string;
        verified?: boolean;
    };
    contact?: Contact;
    constructor(pubkey: string, metadata: MetaOpts, lastUpdatedAt: number);
    setContact(contact: Contact): void;
    static from(event: EventFinalized): Profile;
    isNip05Verified(): Promise<boolean>;
    toUnsignedEvent(): BaseEvent;
}
