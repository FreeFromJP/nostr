import { Event, generatePrivateKey, getEventHash, getPublicKey, nip19, signEvent } from 'nostr-tools'

export const PUBKEY_PREFIX = 'npub'
export const PRIKEY_PREFIX = 'nsec'

export class keys {
    pubkey: string
    privkey: string
    //npub or nsec
    constructor(keyString?: string) {
        if (keyString != null) {
            if (keyString.length != 63) throw 'key length invalid'
            if (keyString.startsWith(PUBKEY_PREFIX)) {
                this.pubkey = nip19.decode(keyString).data as string
                this.privkey = ''
            } else if (keyString.startsWith(PRIKEY_PREFIX)) {
                this.privkey = nip19.decode(keyString).data as string
                this.pubkey = getPublicKey(this.privkey)
            } else {
                throw 'undefine key format'
            }
        } else {
            //generate key for new user
            this.privkey = generatePrivateKey()
            this.pubkey = getPublicKey(this.privkey)
        }
    }

    canSign() {
        return this.privkey != ''
    }

    async sign(event: Event) {
        event.id = getEventHash(event)
        if (this.canSign()) {
            event.sig = signEvent(event, this.privkey)
        } else {
            throw new Error('cannot sign')
        }
        return event
    }
}
