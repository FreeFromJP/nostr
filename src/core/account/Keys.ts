import { generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools'

export const PUBKEY_PREFIX = 'npub'
export const PRIKEY_PREFIX = 'nsec'

export class Keys {
    pubkeyRaw: string
    privkeyRaw: string
    //npub or nsec
    constructor(keyString?: string) {
        if (keyString != null) {
            if (keyString.length != 63) throw 'key length invalid'
            if (keyString.startsWith(PUBKEY_PREFIX)) {
                this.pubkeyRaw = nip19.decode(keyString).data as string
                this.privkeyRaw = ''
            } else if (keyString.startsWith(PRIKEY_PREFIX)) {
                this.privkeyRaw = nip19.decode(keyString).data as string
                this.pubkeyRaw = getPublicKey(this.privkeyRaw)
            } else {
                throw 'undefine key format'
            }
        } else {
            //generate key for new user
            this.privkeyRaw = generatePrivateKey()
            this.pubkeyRaw = getPublicKey(this.privkeyRaw)
        }
    }

    pubkey() {
        return nip19.npubEncode(this.pubkeyRaw)
    }

    privkey() {
        return this.privkeyRaw != '' ? nip19.nsecEncode(this.privkeyRaw) : ''
    }

    canSign() {
        return this.privkeyRaw != ''
    }
}
