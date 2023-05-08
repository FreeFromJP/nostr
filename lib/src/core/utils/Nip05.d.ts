export declare function useFetchImplementation(fetchImplementation: any): void;
export default class Nip05 {
    static fetchPubkey(nip05Id: string): Promise<string | null>;
    static fetchNames(domain: string): Promise<{
        [name: string]: string;
    }>;
    static verify(pubkey: string, nip05Id: string): Promise<boolean>;
}
