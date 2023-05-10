export declare const PUBKEY_PREFIX = "npub";
export declare const PRIKEY_PREFIX = "nsec";
export declare class Keys {
    pubkeyRaw: string;
    privkeyRaw: string;
    constructor(keyString?: string | {
        pubkey?: string;
        privkey: string;
    } | {
        pubkey: string;
        privkey?: string;
    });
    pubkey(): string;
    privkey(): string;
    canSign(): boolean;
    encrypt(otherPubkeyRaw: string, content: string): Promise<string>;
    decrypt(otherPubkeyRaw: string, content: string): Promise<string>;
}
export declare function decodeKey(keyRaw: string): string;
export declare function encodeNPubKey(hexKey: string): string;
export declare function encodeNSecKey(hexKey: string): string;
