import { Tags } from '../event/Event'

/**
 * /NIP-10 tags for kind-1 message
 * DEPRECATED: ["e", <event-id>, <relay-url>]
 * PREFERRED: ["e", <event-id>, <relay-url>, <marker>]
 */
//todo support relay-url?
export type NIP10 = {
    root?: string
    memtions?: string[]
    reference?: string
    p_tags?: string[]
}

export function tagsToNip10(tags: Tags): NIP10 {
    const nip10: NIP10 = {}
    if (tags.length == 0) return nip10
    const p_tags = tags.filter((t) => t[0] == 'p')
    if (p_tags.length > 0) nip10.p_tags = p_tags.map((x) => x[1])
    const e_tags = tags.filter((t) => t[0] == 'e')

    //todo detect which version old or new?
    if (e_tags[0].length < 4) {
        nip10.root = e_tags[0][1]
        switch (e_tags.length) {
            case 1:
                break
            default: //2 or 3 or more
                nip10.memtions = e_tags.slice(1, e_tags.length - 1).map((x) => x[1])
                nip10.reference = e_tags[e_tags.length - 1][1]
        }
    } else if (e_tags[0].length == 4) {
        e_tags.forEach((t) => {
            const [, k, , m] = t
            switch (m) {
                case 'root':
                    nip10.root = k
                    break
                case 'mention':
                    nip10.memtions?.push(k)
                    break
                case 'reply':
                    nip10.reference = k
                    break
            }
        })
    }
    return nip10
}

export function nip10ToTags(nip10: NIP10): Tags {
    const tags: Tags = []
    if (nip10.root != null) {
        tags.push(['e', nip10.root, '', 'root'])
        nip10.memtions?.forEach((m) => {
            tags.push(['e', m, '', 'mention'])
        })
        if (nip10.reference != null) tags.push(['e', nip10.reference, '', 'reply'])
    }
    nip10.p_tags?.forEach((p) => {
        tags.push(['p', p])
    })
    return tags
}
