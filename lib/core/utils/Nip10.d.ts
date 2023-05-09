import { Tags } from '../event/Event';
/**
 * /NIP-10 tags for kind-1 note
 * DEPRECATED: ["e", <event-id>, <relay-url>]
 * PREFERRED: ["e", <event-id>, <relay-url>, <marker>]
 */
export default class NIP10 {
    root?: string;
    memtions: string[];
    refer?: string;
    p_tags: string[];
    constructor(tags?: Tags);
    isRoot(): boolean;
    setRefer(refer: string): void;
    addMentions(newMentions: string[]): void;
    addPubkeys(pks: string[]): void;
    toTags(): Tags;
}
