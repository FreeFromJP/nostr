let _fetch: any

try {
    _fetch = fetch
} catch (e: any) {}

export function useFetchImplementation(fetchImplementation: any) {
    _fetch = fetchImplementation
}

export default class Nip05 {
    static async fetchPubkey(nip05Id: string): Promise<string | null> {
        const [user, host] = nip05Id.split('@')
        if (!user || !host) return null

        const url = `https://${host}/.well-known/nostr.json?name=${user}`
        try {
            const res = await _fetch(url)
            const json = await res.json()
            if (!json || !json.names) return null
            return json.names[user]
        } catch (e) {
            throw new Error(`Failed to fetch NIP05 data for ${nip05Id}`)
        }
    }

    static async fetchNames(domain: string): Promise<{ [name: string]: string }> {
        const url = `https://${domain}/.well-known/nostr.json`
        try {
            const res = await _fetch(url)
            const json = await res.json()
            return json?.names
        } catch (e) {
            throw new Error(`Failed to fetch NIP05 data for ${domain}`)
        }
    }

    static async verify(pubkey: string, nip05Id: string): Promise<boolean> {
        const pk = await Nip05.fetchPubkey(nip05Id)
        return pk === pubkey
    }
}
