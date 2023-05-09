import {
    getPublicKey,
    generatePrivateKey,
    nip19,
    nip04,
    getEventHash,
    signEvent,
    validateEvent,
    verifySignature,
    Kind,
    SimplePool
} from "nostr-tools";

import {
    includes,
    map,
    tail,
    filter
} from "ramda";

const PUBKEY_PREFIX = "npub", PRIKEY_PREFIX = "nsec";

class Keys {
    pubkeyRaw;
    privkeyRaw;
    constructor(t) {
        if (void 0 !== t) {
            if (63 !== t.length) throw "key length invalid";
            if (t.startsWith(PUBKEY_PREFIX)) this.pubkeyRaw = decodeKey(t), this.privkeyRaw = ""; else {
                if (!t.startsWith(PRIKEY_PREFIX)) throw "undefine key format";
                this.privkeyRaw = decodeKey(t), this.pubkeyRaw = getPublicKey(this.privkeyRaw);
            }
        } else this.privkeyRaw = generatePrivateKey(), this.pubkeyRaw = getPublicKey(this.privkeyRaw);
    }
    pubkey() {
        return nip19.npubEncode(this.pubkeyRaw);
    }
    privkey() {
        return this.privkeyRaw ? nip19.nsecEncode(this.privkeyRaw) : "";
    }
    canSign() {
        return Boolean(this.privkeyRaw);
    }
    async encrypt(t, e) {
        if (this.privkeyRaw) return nip04.encrypt(this.privkeyRaw, t, e);
        throw new Error("can not encrypt");
    }
    decrypt(t, e) {
        if (this.privkeyRaw) return nip04.decrypt(this.privkeyRaw, t, e);
        throw new Error("can not decrypt");
    }
}

function decodeKey(t) {
    return nip19.decode(t).data;
}

function now() {
    return Math.floor(Date.now() / 1e3);
}

function getOptionalTagValueByName(t, ...e) {
    const n = t.filter(t => includes(t[0], e));
    return e.map(e => map(tail, filter(t => t[0] === e, n)));
}

function getTagValueByName(t, e) {
    if (0 !== t.length) return map(tail, filter(t => Array.isArray(t) && t[0] === e, t));
}

function getRequiredTagValueByName(t, e) {
    t = getTagValueByName(t, e);
    if (void 0 === t) throw new Error(`[params error] get required tag ${e} failed`);
    if (0 === t.length) throw new Error(`[params error] tag ${e} not found in taglist`);
    return t;
}

function getRequiredFirstTagValue(t, e) {
    t = getRequiredTagValueByName(t, e)[0];
    if (0 === t.length) throw new Error("expecting at least one tag value after tag name");
    return t[0];
}

var Misc = Object.freeze({
    __proto__: null,
    getOptionalTagValueByName: getOptionalTagValueByName,
    getRequiredFirstTagValue: getRequiredFirstTagValue,
    getRequiredTagValueByName: getRequiredTagValueByName,
    getTagValueByName: getTagValueByName,
    now: now
});

const KnownEventKind = {
    METADATA: 0,
    NOTE: 1,
    RELAY: 2,
    CONTACT: 3,
    DM: 4,
    DELETE: 5,
    REPOST: 6,
    REACTION: 7,
    BADGE_PROFILE: 8,
    CHATROOM: 42,
    BDADE_REWARD: 30008,
    BADGE_DEFINATION: 30009
};

class BaseEvent {
    id;
    pubkey;
    created_at;
    kind;
    tags;
    content;
    sig;
    constructor(t) {
        if (t && t.sig) {
            if (!validate(t)) throw new Error("pares error!");
            this.id = t.id, this.pubkey = t.pubkey, this.created_at = t.created_at, 
            this.kind = t.kind, this.tags = t.tags, this.content = t.content, this.sig = t.sig;
        } else this.id = t?.id || "", this.pubkey = t?.pubkey || "", this.created_at = t?.created_at || now(), 
        this.kind = t?.kind || -1, this.tags = t?.tags || [], this.content = t?.content || "", 
        this.sig = t?.sig || "";
    }
    get author() {
        return this.pubkey;
    }
    hash() {
        this.id || (this.id = getEventHash(this));
    }
    async modify(t, ...e) {
        return await t(this, ...e), this;
    }
    signByKey(t) {
        if (!t.canSign()) throw new Error("cannot get signed");
        this.pubkey = t.pubkeyRaw, this.hash(), this.sig = signEvent(this, t.privkeyRaw);
    }
    finalized() {
        var t = {
            id: this.id,
            kind: this.kind,
            pubkey: this.pubkey,
            content: this.content,
            tags: this.tags,
            sig: this.sig,
            created_at: this.created_at
        };
        if (validate(t)) return t;
        throw new Error("not a finalized event");
    }
}

function validate(t) {
    return validateEvent(t) && verifySignature(t);
}

class NIP10 {
    root;
    memtions = [];
    refer;
    p_tags = [];
    constructor(t) {
        var e;
        t && 0 < t.length && (0 < (e = t.filter(t => "p" === t[0])).length && (this.p_tags = e.map(t => t[1])), 
        0 < (e = t.filter(t => "e" === t[0])).length) && (e[0].length < 4 ? 1 === e.length ? this.refer = e[0][1] : (this.root = e[0][1], 
        this.memtions = e.slice(1, e.length - 1).map(t => t[1]), this.refer = e[e.length - 1][1]) : 4 === e[0].length && e.forEach(t => {
            var [ , e, , t ] = t;
            switch (t) {
              case "root":
                this.root = e;
                break;

              case "mention":
                this.memtions.push(e);
                break;

              case "reply":
                this.refer = e;
            }
        }));
    }
    isRoot() {
        return !this.root && !this.refer;
    }
    setRefer(t) {
        this.refer = t;
    }
    addMentions(t) {
        this.memtions = this.memtions.concat(t);
    }
    addPubkeys(t) {
        this.p_tags = this.p_tags.concat(t);
    }
    toTags() {
        const e = [];
        return this.root && e.push([ "e", this.root, "", "root" ]), this.memtions.forEach(t => {
            e.push([ "e", t, "", "mention" ]);
        }), this.refer && e.push([ "e", this.refer, "", "reply" ]), this.p_tags.forEach(t => {
            e.push([ "p", t ]);
        }), e;
    }
}

async function toMetadata(t, e) {
    t.kind = KnownEventKind.METADATA, t.content = JSON.stringify(e);
}

async function toNote(t, e) {
    t.kind = KnownEventKind.NOTE, t.content = e;
}

async function toReply(t, e, n) {
    t.kind = KnownEventKind.NOTE, t.content = n;
    n = new NIP10(e.tags);
    if (n.root || n.refer) if (!n.root && n.refer) n.root = n.refer; else {
        if (!n.root || !n.refer) throw new Error("Relpy to invaild content");
        n.addMentions([ n.refer ]);
    }
    n.addPubkeys([ e.author ]), n.setRefer(e.id);
    e = n.toTags();
    t.tags = e;
}

async function toContact(t, e, n) {
    t.kind = KnownEventKind.CONTACT, t.content = JSON.stringify(e);
    e = n.map(t => {
        var e = [];
        return e.push("p"), e.push(t[1]), t[2] && e.push(t[2]), t[3] && e.push(t[3]), 
        e;
    });
    t.tags = e;
}

async function toDM(t, e, n, i, s) {
    t.kind = KnownEventKind.DM, t.content = await e.encrypt(n, i), t.tags = [ [ "p", n ] ], 
    s?.replyId && t.tags.push([ "e", s.replyId, s.relay || "", "reply" ]);
}

async function toRepost(t, e) {
    t.kind = KnownEventKind.REPOST, t.content = JSON.stringify(e);
    t = e.tags.filter(t => "p" === t[0]);
    t.unshift([ "e", e.id ]), t.push([ "p", e.pubkey ]);
}

async function toReaction(t, e, n) {
    t.kind = KnownEventKind.REACTION, t.content = n;
    var n = e.tags.filter(t => "e" === t[0]), i = e.tags.filter(t => "p" === t[0]);
    t.tags = n.concat([ [ "e", e.id ] ]).concat(i).concat([ [ "p", e.pubkey ] ]);
}

async function addMentionProfile(t, e, n, i) {
    i = "nostr:" + nip19.nprofileEncode({
        pubkey: n,
        relays: i
    });
    t.content = t.content.slice(0, e) + " " + i + " " + t.content.slice(e), t.tags.push([ "p", n, "", "mention" ]);
}

let _fetch;

try {
    _fetch = fetch;
} catch (t) {}

function useFetchImplementation(t) {
    _fetch = t;
}

class Nip05 {
    static async fetchPubkey(e) {
        var [ t, n ] = e.split("@");
        if (!t || !n) return null;
        n = `https://${n}/.well-known/nostr.json?name=` + t;
        try {
            var i = await (await _fetch(n)).json();
            return i && i.names ? i.names[t] : null;
        } catch (t) {
            throw new Error("Failed to fetch NIP05 data for " + e);
        }
    }
    static async fetchNames(e) {
        var t = `https://${e}/.well-known/nostr.json`;
        try {
            return (await (await _fetch(t)).json())?.names;
        } catch (t) {
            throw new Error("Failed to fetch NIP05 data for " + e);
        }
    }
    static async verify(t, e) {
        return await Nip05.fetchPubkey(e) === t;
    }
}

class Contact {
    relays = [];
    contacts = [];
    lastUpdatedAt;
    constructor(t, e, n) {
        for (var [ i, s ] of Object.entries(t)) this.relays.push({
            url: i,
            read: s.read,
            write: s.write
        });
        this.contacts = e.map(t => ({
            pubkeyRaw: t[1],
            mainRelay: t[2] || "",
            petname: t[3] || ""
        })), this.lastUpdatedAt = n;
    }
    static from(t) {
        if (t.kind !== KnownEventKind.CONTACT) throw new Error("kind-3 event expected");
        let e = {}, n = [];
        var i = new BaseEvent(t);
        try {
            try {
                e = JSON.parse(t.content);
            } catch (t) {}
            0 < t.tags.length && (n = t.tags.filter(t => "p" === t[0]));
        } catch (t) {
            throw new Error("parse contacts error");
        }
        return new Contact(e, n, i.created_at);
    }
    toUnsignedEvent() {
        var t = new BaseEvent();
        const e = {}, n = (this.relays.forEach(t => {
            e[t.url] = {
                read: t.read,
                write: t.write
            };
        }), []);
        return this.contacts.forEach(t => {
            n.push([ "p", t.pubkeyRaw, t.mainRelay, t.petname ]);
        }), t.modify(toContact, e, n), t;
    }
}

class EncryptedDirectMessage extends BaseEvent {
    constructor(t) {
        var e = [];
        e.push([ "p", t.recipients ]), t.replyId && e.push([ "e", t.replyId, t.relay || "", "reply" ]), 
        super({
            tags: e,
            kind: Kind.EncryptedDirectMessage,
            content: ""
        }), this.recipients = t.recipients, this.plaintext = t.plaintext;
    }
    recipients;
    plaintext = "";
    static from(t) {
        if (t.kind !== Kind.EncryptedDirectMessage) throw new Error(`Must be an kind-${Kind.EncryptedDirectMessage}: encrypted direct message`);
        var e = t.tags.filter(t => "p" === t[0])[0], e = e && e[1], e = new EncryptedDirectMessage({
            plaintext: "",
            recipients: e
        });
        return e.tags = t.tags, e.content = t.content, e.pubkey = t.pubkey, e.id = t.id, 
        e.sig = t.sig, e.created_at = t.created_at, e;
    }
    async encryptContent(t) {
        if (!this.content) {
            if (!this.recipients) return "";
            this.pubkey = t.pubkey(), this.content = await t.encrypt(this.recipients, this.plaintext);
        }
        return this.content;
    }
    async decryptContent(t) {
        if (!this.plaintext) {
            if (!this.recipients) return "";
            this.plaintext = await t.decrypt(this.recipients, this.content);
        }
        return this.plaintext;
    }
    toUnsignedEvent() {
        return new BaseEvent({
            kind: this.kind,
            content: this.content,
            tags: this.tags,
            created_at: this.created_at
        });
    }
}

class Note extends BaseEvent {
    nip10;
    replies = [];
    parent;
    reactions;
    reposts = 0;
    constructor(t, e = null) {
        super(t), this.nip10 = new NIP10(t.tags), this.parent = e;
    }
    addReply(t) {
        (t.parent = this).replies.push(t);
    }
    findAncestor() {
        let t = this.parent;
        for (;t && t.parent; ) t = t.parent;
        return t;
    }
    traverseNotes() {
        const n = [], i = t => {
            n.push(t), t.replies.sort((t, e) => t.created_at - e.created_at);
            for (const e of t.replies) i(e);
        };
        return i(this), n;
    }
}

class Profile {
    pubkey;
    name;
    display_name;
    picture;
    banner;
    about;
    website;
    lud06;
    lud16;
    lastUpdatedAt;
    nip05;
    contact;
    constructor(t, e, n) {
        this.pubkey = t, this.lastUpdatedAt = n, this.name = e.name, this.about = e.about, 
        this.picture = e.picture, this.nip05 = {
            url: e.nip05,
            verified: void 0
        }, this.lud06 = e.lud06, this.lud16 = e.lud16;
    }
    setContact(t) {
        this.contact = t;
    }
    static from(t) {
        if (t.kind !== KnownEventKind.METADATA) throw new Error("kind-1 event expected");
        var e = new BaseEvent(t), t = JSON.parse(t.content);
        return new Profile(nip19.npubEncode(e.pubkey), t, e.created_at);
    }
    async isNip05Verified() {
        if (!this.nip05) return !1;
        if (!this.nip05.verified) {
            if (!this.nip05.url) return !1;
            this.nip05.verified = await Nip05.verify(nip19.decode(this.pubkey).data, this.nip05.url);
        }
        return this.nip05.verified;
    }
    toUnsignedEvent() {
        var t = new BaseEvent(), e = {
            name: this.name,
            display_name: this.display_name,
            picture: this.picture,
            banner: this.banner,
            about: this.about,
            website: this.website,
            nip05: this.nip05?.url,
            lud06: this.lud06,
            lud16: this.lud16
        };
        return t.modify(toMetadata, e), t;
    }
}

class DirectMessage {
    constructor(t) {
        this.keys = t.keys, this.pubkey = t.keys.pubkeyRaw;
    }
    pubkey;
    keys;
    sub;
    async history(t, e) {
        var {
            rescipients: e,
            until: n,
            limit: i = 10
        } = e, s = this.pubkey;
        if (e) return e = {
            kinds: [ Kind.EncryptedDirectMessage ],
            authors: [ s, e ],
            "#p": [ e, s ],
            limit: i,
            until: n
        }, s = (await t.fetch([ e ])).map(async t => {
            t = EncryptedDirectMessage.from(t);
            return await t.decryptContent(this.keys), t;
        }), Promise.all(s);
        throw new Error("rescipients is required");
    }
    subscribe(t, e, n) {
        this.sub && this.sub.unsub();
        var {
            limit: n = 500,
            since: i
        } = n, s = this.pubkey, r = {
            kinds: [ Kind.EncryptedDirectMessage ],
            authors: [ s ],
            limit: n,
            since: i
        }, s = {
            kinds: [ Kind.EncryptedDirectMessage ],
            "#p": [ s ],
            limit: n,
            since: i
        };
        t.subscribe([ r, s ]).on("event", async t => {
            t = EncryptedDirectMessage.from(t);
            await t.decryptContent(this.keys), e(t);
        });
    }
}

async function fetchProfiles(t, e) {
    e = {
        kinds: [ KnownEventKind.METADATA ],
        authors: e.map(t => decodeKey(t))
    }, t = (await t.fetch([ e ])).map(t => Profile.from(t));
    const n = {};
    return t.forEach(t => {
        void 0 === n[t.pubkey] ? n[t.pubkey] = t : n[t.pubkey] = n[t.pubkey].lastUpdatedAt > t.lastUpdatedAt ? n[t.pubkey] : t;
    }), n;
}

async function fetchContact(t, e) {
    var e = {
        kinds: [ KnownEventKind.CONTACT ],
        authors: [ e ]
    }, t = await t.fetch([ e ]);
    return 0 === t.length ? null : 1 === t.length ? Contact.from(t[0]) : (e = t.reduce((t, e) => t.created_at > e.created_at ? t : e), 
    Contact.from(e));
}

async function fetchNotes(t, e) {
    e = {
        kinds: [ KnownEventKind.NOTE ],
        ids: e
    };
    return (await t.fetch([ e ])).map(t => new Note(t));
}

async function fetchRepliesOrdered(t, e, n = 500, i) {
    e = {
        kinds: [ KnownEventKind.NOTE ],
        "#e": [ e ],
        limit: n
    }, i && (e.until = i), n = await t.fetch([ e ]);
    return 0 === n.length ? [] : n.sort((t, e) => t.created_at - e.created_at).map(t => new Note(t));
}

async function fetchReposts(t, e) {
    e = {
        kinds: [ KnownEventKind.REPOST ],
        "#e": [ e ]
    };
    return t.fetch([ e ]);
}

async function fetchReactions(t, e) {
    e = {
        kinds: [ KnownEventKind.REACTION ],
        "#e": [ e ]
    };
    return t.fetch([ e ]);
}

function sortDesc(t) {
    return t.sort((t, e) => e.created_at - t.created_at);
}

class Repost extends BaseEvent {
    orgNote;
    constructor(t) {
        super(t);
        try {
            const t = JSON.parse(this.content);
            1 === t.kind && (this.orgNote = new Note(t));
        } catch (t) {}
    }
    async loadOrgNote(t) {
        if (!this.orgNote) try {
            var e = {
                ids: [ this.tags.filter(t => "e" === t[0])[0][1] ],
                limit: 1
            }, n = (await t.fetch([ e ]))[0];
            1 === n.kind && (this.orgNote = new Note(n));
        } catch (t) {
            throw new Error("Error fetching original event of this repost");
        }
    }
}

function parse2Item(t) {
    if (t.kind === KnownEventKind.NOTE) return new Note(t);
    if (t.kind === KnownEventKind.REPOST) return new Repost(t);
    throw new Error("not a note nor repost");
}

class Following {
    notes = [];
    followingPubkeysRaw = [];
    sub;
    constructor(t) {
        this.followingPubkeysRaw = t.map(t => decodeKey(t));
    }
    async digging(t, e, n = 100, i) {
        n = {
            kinds: [ KnownEventKind.NOTE, KnownEventKind.REPOST ],
            authors: this.followingPubkeysRaw,
            limit: n
        }, null != i ? n.until = i : 0 < this.notes.length && (n.until = this.notes[this.notes.length - 1].created_at), 
        i = await t.fetch([ n ]), t = sortDesc(i).map(t => parse2Item(t));
        this.notes = this.notes.concat(t), e(t);
    }
    sub4Incoming(t, e, n = 100, i) {
        this.sub && this.sub.unsub();
        n = {
            kinds: [ KnownEventKind.NOTE ],
            authors: this.followingPubkeysRaw,
            limit: n
        }, null != i ? n.since = i : 0 < this.notes.length ? n.since = this.notes[0].created_at : n.since = now(), 
        i = t.subscribe([ n ]);
        i.on("event", t => {
            t = parse2Item(t);
            this.notes.unshift(t), e(t);
        }), this.sub = i;
    }
    async quickStart(t, e = 100, n, i) {
        this.notes = [];
        var s = now();
        await this.digging(t, n, e, s), this.sub4Incoming(t, i, 0, s - 1);
    }
}

class NostrClient {
    constructor(t, e = {}) {
        this.pool = new SimplePool(e), this.relays = t;
    }
    pool;
    relays = [];
    close(t) {
        const e = t || this.relays;
        t = this.relays.filter(t => !e.includes(t));
        return this.relays = t, this.pool.close(e), this.relays;
    }
    subscribe(t, e) {
        return this.pool.sub(this.relays, t, e);
    }
    publish(t) {
        const i = this.relays.length, s = this.pool.publish(this.relays, t);
        return new Promise((t, e) => {
            let n = 0;
            s.on("ok", () => {
                t();
            }), s.on("failed", t => {
                n++, i === n && e(t);
            });
        });
    }
    fetch(t, e) {
        return this.pool.list(this.relays, t, e);
    }
    seenOn(t) {
        return this.pool.seenOn(t);
    }
}

class Thread {
    root;
    collection = {};
    constructor(t) {
        this.root = t, this.collection[t.id] = t;
    }
    async loadReply(t, e = 500, n) {
        const i = await fetchRepliesOrdered(t, this.root.id, e, n), s = (i.forEach(t => {
            this.collection[t.id] = t;
        }), e => {
            i.filter(t => t.nip10.refer === e.id).forEach(t => {
                e.addReply(t), s(t);
            });
        });
        s(this.root);
    }
    unscrollReplies(t) {
        return this.collection[t.id] ? t.traverseNotes() : [];
    }
}

export {
    BaseEvent,
    Contact,
    DirectMessage,
    EncryptedDirectMessage,
    Following,
    Keys,
    KnownEventKind,
    Nip05 as NIP05,
    NIP10,
    NostrClient,
    Note,
    PRIKEY_PREFIX,
    PUBKEY_PREFIX,
    Profile,
    Thread,
    addMentionProfile,
    decodeKey,
    fetchContact,
    fetchNotes,
    fetchProfiles,
    fetchReactions,
    fetchRepliesOrdered,
    fetchReposts,
    toContact,
    toDM,
    toMetadata,
    toNote,
    toReaction,
    toReply,
    toRepost,
    useFetchImplementation,
    Misc as utils
};
