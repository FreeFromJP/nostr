import { generatePrivateKey, getPublicKey, nip04, nip19 } from 'nostr-tools'

export const PUBKEY_PREFIX = 'npub'
export const PRIKEY_PREFIX = 'nsec'

export class Keys {
    pubkeyRaw: string
    privkeyRaw: string
    //npub or nsec
    constructor(
        keyString?:
            | string
            | {
                  pubkey?: string
                  privkey: string
              }
            | {
                  pubkey: string
                  privkey?: string
              },
    ) {
        if (typeof keyString === 'string') {
            if (keyString.length !== 63) throw 'key length invalid'
            if (keyString.startsWith(PUBKEY_PREFIX)) {
                this.pubkeyRaw = decodeKey(keyString)
                this.privkeyRaw = ''
            } else if (keyString.startsWith(PRIKEY_PREFIX)) {
                this.privkeyRaw = decodeKey(keyString)
                this.pubkeyRaw = getPublicKey(this.privkeyRaw)
            } else {
                throw 'undefine key format'
            }
        } else if (keyString && keyString.privkey) {
            if (keyString.privkey.length !== 64) throw 'key length invalid'
            this.privkeyRaw = keyString.privkey
            this.pubkeyRaw = getPublicKey(this.privkeyRaw)
        } else if (keyString && keyString.pubkey) {
            if (keyString.pubkey.length !== 64) throw 'key length invalid'
            this.pubkeyRaw = keyString.pubkey
            this.privkeyRaw = ''
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
        return this.privkeyRaw ? nip19.nsecEncode(this.privkeyRaw) : ''
    }

    canSign() {
        return Boolean(this.privkeyRaw)
    }

    //for DM
    async encrypt(otherPubkeyRaw: string, content: string) {
        if (!this.privkeyRaw) throw new Error('can not encrypt')
        return await nip04.encrypt(this.privkeyRaw, otherPubkeyRaw, content)
    }

    decrypt(otherPubkeyRaw: string, content: string) {
        if (!this.privkeyRaw) throw new Error('can not decrypt')
        return nip04.decrypt(this.privkeyRaw, otherPubkeyRaw, content)
    }
}

export function decodeKey(keyRaw: string): string {
    return nip19.decode(keyRaw).data as string
}

export function encodeNPubKey(hexKey: string): string {
    return nip19.npubEncode(hexKey)
}

export function encodeNSecKey(hexKey: string): string {
    return nip19.nsecEncode(hexKey)
}
