import { generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools'

export const PUBKEY_PREFIX = 'npub'
export const PRIKEY_PREFIX = 'nsec'

export class Keys {
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

    encodedPubkey() {
        return nip19.npubEncode(this.pubkey)
    }

    encodedPrivkey() {
        return this.privkey != '' ? nip19.nsecEncode(this.privkey) : ''
    }

    canSign() {
        return this.privkey != ''
    }
}
