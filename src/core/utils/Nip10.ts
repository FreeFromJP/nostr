import { Tags } from '../event/Event'

/**
 * /NIP-10 tags for kind-1 message
 * DEPRECATED: ["e", <event-id>, <relay-url>]
 * PREFERRED: ["e", <event-id>, <relay-url>, <marker>]
 */
//todo support relay-url?
export default class NIP10 {
    root?: string
    memtions: string[] = []
    refer?: string
    p_tags: string[] = []

    constructor(tags?: Tags) {
        if (tags && tags.length > 0) {
            const p_tags = tags.filter((t) => t[0] == 'p')
            if (p_tags.length > 0) this.p_tags = p_tags.map((x) => x[1])
            const e_tags = tags.filter((t) => t[0] == 'e')
            //todo detect which version old or new?
            if (e_tags[0].length < 4) {
                switch (e_tags.length) {
                    case 1:
                        this.refer = e_tags[0][1]
                        break
                    default: //2 or 3 or more
                        this.root = e_tags[0][1]
                        this.memtions = e_tags.slice(1, e_tags.length - 1).map((x) => x[1])
                        this.refer = e_tags[e_tags.length - 1][1]
                }
            } else if (e_tags[0].length == 4) {
                e_tags.forEach((t) => {
                    const [, k, , m] = t
                    switch (m) {
                        case 'root':
                            this.root = k
                            break
                        case 'mention':
                            this.memtions.push(k)
                            break
                        case 'reply':
                            this.refer = k
                            break
                    }
                })
            }
        }
    }

    setRefer(refer: string) {
        this.refer = refer
    }

    addMentions(newMentions: string[]) {
        this.memtions = this.memtions.concat(newMentions)
    }

    addPubkeys(pks: string[]) {
        this.p_tags = this.p_tags.concat(pks)
    }

    toTags(): Tags {
        const tags: Tags = []
        if (this.root != null) tags.push(['e', this.root, '', 'root'])
        this.memtions.forEach((m) => {
            tags.push(['e', m, '', 'mention'])
        })
        if (this.refer != null) tags.push(['e', this.refer, '', 'reply'])
        this.p_tags.forEach((p) => {
            tags.push(['p', p])
        })
        return tags
    }
}
