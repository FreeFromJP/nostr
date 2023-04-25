import {generatePrivateKey, getPublicKey, nip19} from "nostr-tools"

export const PUBKEY_PREFIX = "npub"
export const PRIKEY_PREFIX = "nsec"

export class keys {
    pubkey: string
    prikey: string
    //npub or nsec
    constructor(keyString?:string) {
        if(keyString != null) {
            if(keyString.length != 63) throw "key length invalid"
            if(keyString.startsWith(PUBKEY_PREFIX)){
                this.pubkey = nip19.decode(keyString).data as string
                this.prikey = ""
            }else if (keyString.startsWith(PRIKEY_PREFIX)){
                this.prikey = nip19.decode(keyString).data as string
                this.pubkey = getPublicKey(this.prikey)
            }else{
                throw "undefine key format"
            }
        }else{
            //generate key for new user
            this.prikey = generatePrivateKey()
            this.pubkey = getPublicKey(this.prikey)
        }
    }

    canSign() {
        return this.prikey != ""
    }

}