import {
    getPublicKey,
    generatePrivateKey,
    nip19,
    nip04,
    nip27,
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
        if ("string" == typeof t) {
            if (63 !== t.length) throw "key length invalid";
            if (t.startsWith(PUBKEY_PREFIX)) this.pubkeyRaw = decodeKey(t), this.privkeyRaw = ""; else {
                if (!t.startsWith(PRIKEY_PREFIX)) throw "undefine key format";
                this.privkeyRaw = decodeKey(t), this.pubkeyRaw = getPublicKey(this.privkeyRaw);
            }
        } else if (t && t.privkey) {
            if (64 !== t.privkey.length) throw "key length invalid";
            this.privkeyRaw = t.privkey, this.pubkeyRaw = getPublicKey(this.privkeyRaw);
        } else if (t && t.pubkey) {
            if (64 !== t.pubkey.length) throw "key length invalid";
            this.pubkeyRaw = t.pubkey, this.privkeyRaw = "";
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

function encodeNPubKey(t) {
    return nip19.npubEncode(t);
}

function encodeNSecKey(t) {
    return nip19.nsecEncode(t);
}

class TextExtraction {
    constructor(t, e) {
        this.text = t, this.patterns = e || [];
    }
    parse() {
        let e = [ {
            children: this.text
        } ];
        return this.patterns.forEach(a => {
            let o = [];
            var t = a.nonExhaustiveModeMaxMatchCount || 0;
            const c = Math.min(Math.max(Number.isInteger(t) ? t : 0, 0) || Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
            let h = 0;
            e.forEach(n => {
                if (n._matched) o.push(n); else {
                    var i = [];
                    let t = n.children;
                    let e;
                    for (a.pattern.lastIndex = 0; t && (e = a.pattern.exec(t)); ) {
                        var r = t.substr(0, e.index), s = e.index;
                        if (++h > c) break;
                        i.push({
                            children: r
                        }), i.push(this.getMatchedPart(a, e[0], e, s)), t = t.substr(e.index + e[0].length), 
                        e[0].length, a.pattern.lastIndex = 0;
                    }
                    i.push({
                        children: t
                    }), o.push(...i);
                }
            }), e = o;
        }), e.forEach(t => delete t._matched), e.filter(t => !!t.children);
    }
    getMatchedPart(e, n, t, i) {
        let r = {}, s = (Object.keys(e).forEach(t => {
            "pattern" !== t && "renderText" !== t && "nonExhaustiveModeMaxMatchCount" !== t && ("function" == typeof e[t] ? r[t] = () => e[t](n, i) : r[t] = e[t]);
        }), n);
        return e.renderText && "function" == typeof e.renderText && (s = e.renderText(n, t)), 
        {
            ...r,
            children: s,
            _matched: !0
        };
    }
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

function classifyURL(t) {
    t = t.split(".").pop()?.toLowerCase();
    return t ? [ "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp" ].includes(t) ? "image" : [ "mp4", "avi", "mov", "wmv", "flv", "mkv", "webm" ].includes(t) ? "video" : [ "mp3", "wav", "ogg", "m4a", "flac", "aac" ].includes(t) ? "audio" : "link" : "link";
}

const HTTP_URL_REGEX = /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/i, NOSTR_URI_REGEX = nip27.regex();

function parseContent(t, e = {
    httpUrl: !0,
    nostrUri: !0,
    tag: !0
}) {
    var n = t.content, i = [];
    return e.httpUrl && i.push({
        pattern: HTTP_URL_REGEX,
        renderText: (t, e) => {
            return {
                type: classifyURL(t),
                url: t.startsWith("http") ? t : "https://" + t,
                content: t
            };
        }
    }), e.nostrUri && i.push({
        pattern: NOSTR_URI_REGEX,
        renderText: (t, e) => {
            return {
                ...nip19.decode(e[1]),
                content: e[0]
            };
        }
    }), e.tag && (e = t.tags.filter(t => "t" === t[0]).map(t => t[1]).join("|"), 
    t = new RegExp(`\\B#(${e})\\b`, "gi"), i.push({
        pattern: t,
        renderText: (t, e) => ({
            type: "tag",
            content: t,
            data: e[1].toLowerCase()
        })
    })), new TextExtraction(n, i).parse().map(t => {
        t = t.children;
        return "string" == typeof t ? {
            type: "text",
            content: t
        } : t;
    });
}

function normolizeContent(t) {
    var e = t.content;
    const r = t.tags;
    return r.find(t => "p" === t[0]) ? (t = [ {
        pattern: /\B#\[(\d+)\]\B/gi,
        renderText: (t, e) => {
            var e = Number(e[1]), [ e, n, i ] = r[e];
            return "p" !== e ? {
                type: "text",
                content: t
            } : {
                type: "pubkey",
                content: "nostr:" + nip19.nprofileEncode({
                    pubkey: n,
                    relays: i ? [ i ] : void 0
                })
            };
        }
    } ], new TextExtraction(e, t).parse().map(t => {
        t = t.children;
        return "string" == typeof t ? {
            type: "text",
            content: t
        } : t;
    }).map(t => t.content).join("")) : e;
}

var Misc = Object.freeze({
    __proto__: null,
    HTTP_URL_REGEX: HTTP_URL_REGEX,
    NOSTR_URI_REGEX: NOSTR_URI_REGEX,
    classifyURL: classifyURL,
    getOptionalTagValueByName: getOptionalTagValueByName,
    getRequiredFirstTagValue: getRequiredFirstTagValue,
    getRequiredTagValueByName: getRequiredTagValueByName,
    getTagValueByName: getTagValueByName,
    normolizeContent: normolizeContent,
    now: now,
    parseContent: parseContent
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
    BADGE_PROFILE: 30008,
    BDADE_REWARD: 8,
    BADGE_DEFINATION: 30009,
    CHANNEL_CREATION: 40,
    CHANNEL_METADATA: 41,
    CHANNEL_MESSAGE: 42,
    REPORTING: 1984
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
            if (!validate(t)) throw new Error("[new BaseEvent] parameter error!");
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
                this.root = e, this.refer || (this.refer = e);
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

async function toDM(t, e, n, i, r) {
    t.kind = KnownEventKind.DM, t.content = await e.encrypt(n, i), t.tags = [ [ "p", n ] ], 
    r?.replyId && t.tags.push([ "e", r.replyId, r.relay || "", "reply" ]);
}

async function toDelete(e, n, t) {
    e.kind = KnownEventKind.DELETE, t.forEach(t => {
        if (t.pubkey === n) try {
            new BaseEvent(t), e.tags.push([ "e", t.id ]);
        } catch (t) {}
    });
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

async function toBadgeDefinition(t, e, n, i, r, s) {
    t.kind = KnownEventKind.BADGE_DEFINATION, t.tags.push([ "d", e ]), t.tags.push([ "name", n ]), 
    t.tags.push([ "description", i ]), t.tags.push(r);
    for (const a of s) t.tags.push(a);
}

async function toBadgeAward(t, e, n, i) {
    t.kind = KnownEventKind.BDADE_REWARD, t.tags.push([ "a", KnownEventKind.BDADE_REWARD + ":" + e + ":" + n ]);
    for (const s of i) {
        var r = [];
        r.push("p"), r.push(s[1]), s[2] && r.push(s[2]), t.tags.push(r);
    }
}

async function toBadgeProfile(t, e) {
    t.kind = KnownEventKind.BADGE_PROFILE, t.tags.push([ "d", "profile_badges" ]);
    for (const n of e) t.tags.push([ "a", KnownEventKind.BADGE_PROFILE + ":" + n.issuerPubkeyRaw + ":" + n.def ]), 
    t.tags.push([ "e", n.issueEvent, n.mainRelay ]);
}

async function toReport(n, t) {
    n.kind = KnownEventKind.REPORTING, t.forEach(t => {
        switch (t.reportType) {
          case "profile":
            n.tags.push([ "p", t.reportPubkey, t.reason ]);
            break;

          case "event":
            var e = t;
            n.tags.push([ "e", e.reason, e.reason ]), n.tags.push([ "p", e.reportPubkey ]);
            break;

          case "impersonation":
            e = t;
            n.tags.push([ "p", e.impersonator, "impersonation" ]), n.tags.push([ "p", e.victim ]);
        }
    });
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

class Channel {
    constructor(t) {
        this.name = t.name, this.about = t.about, this.picture = t.picture, t.extra && (this.extra = t.extra), 
        this.id = t.id || "", this.creator = t.creator, this.relay = t.relay || "", 
        this.lastUpdatedAt = t.lastUpdatedAt || now();
    }
    name = "";
    about = "";
    picture = "";
    extra = {};
    id = "";
    relay = "";
    creator;
    lastUpdatedAt;
    static from(t, e) {
        const n = t.pubkey, i = t.id;
        let r = void 0;
        var e = ((r = e ? e.filter(t => {
            return t.pubkey === n && t.tags.find(t => "e" === t[0])?.[1] === i;
        }).sort((t, e) => 0 <= t.created_at - e.created_at ? -1 : 1)[0] : r) || t).content, [ , , s ] = r ? r.tags.find(t => "e" === t[0]) : [];
        const {
            name: a,
            about: o,
            picture: c,
            ...h
        } = Channel.parseContent(e);
        return new Channel({
            id: i,
            creator: n,
            name: a,
            about: o,
            picture: c,
            extra: h,
            relay: s,
            lastUpdatedAt: (r || t).created_at
        });
    }
    static parseContent(t) {
        var e = {
            name: "",
            about: "",
            picture: ""
        };
        try {
            var n = JSON.parse(t);
            return Object.assign(e, n);
        } catch (t) {
            return e;
        }
    }
    toUnsignedEvent() {
        var t = JSON.stringify({
            name: this.name,
            about: this.about,
            picture: this.picture,
            ...this.extra
        });
        if (!this.id) {
            const n = new BaseEvent({
                kind: KnownEventKind.CHANNEL_CREATION,
                tags: [],
                content: t
            });
            return n;
        }
        var e = [ [ "e", this.id, this.relay ] ];
        const n = new BaseEvent({
            kind: KnownEventKind.CHANNEL_METADATA,
            tags: e,
            content: t
        });
        return n;
    }
}

class ChannelMessage extends BaseEvent {
    constructor(t) {
        if (!t.channel.id) throw new Error("channel id is required");
        if (t.replyTo && !t.replyTo.id) throw new Error("replyTo id is required");
        super({
            content: t.content,
            kind: KnownEventKind.CHANNEL_MESSAGE
        }), this.channel = t.channel, this.replyTo = t.replyTo;
    }
    relay = "";
    channel;
    replyTo;
    static from(t) {
        if (t.kind !== KnownEventKind.CHANNEL_MESSAGE) throw new Error(`Must be an kind-${KnownEventKind.CHANNEL_MESSAGE}: channel message`);
        var e = t.tags.find(t => "e" === t[0] && "root" === t[3]), n = e && e[1], e = e && e[2], i = t.tags.find(t => "e" === t[0] && "reply" === t[3]), r = i && i[1], i = i ? i[2] : "", s = t.tags.find(t => "p" === t[0]), s = s && s[1];
        return n ? ((n = new ChannelMessage({
            channel: {
                id: n,
                relay: e || ""
            },
            replyTo: r && s ? {
                id: r,
                relay: i,
                pubkey: s
            } : void 0,
            content: t.content
        })).tags = t.tags, n.content = t.content, n.pubkey = t.pubkey, n.id = t.id, 
        n.sig = t.sig, n.created_at = t.created_at, n) : null;
    }
    toUnsignedEvent() {
        var t = [];
        return t.push([ "e", this.channel.id, this.channel.relay, "root" ]), this.replyTo && (t.push([ "e", this.replyTo.id, this.replyTo.relay, "reply" ]), 
        t.push([ "p", this.replyTo.pubkey, this.replyTo.relay ])), {
            kind: KnownEventKind.CHANNEL_MESSAGE,
            tags: t,
            content: this.content,
            created_at: Date.now()
        };
    }
}

class Contact {
    relays = [];
    contacts = [];
    lastUpdatedAt;
    pubkeyRaw;
    created_at;
    constructor(t, e, n, i) {
        for (var [ r, s ] of Object.entries(t)) this.relays.push({
            url: r,
            read: s.read,
            write: s.write
        });
        this.contacts = e.map(t => ({
            pubkeyRaw: t[1],
            mainRelay: t[2] || "",
            petname: t[3] || ""
        })), this.lastUpdatedAt = n, this.created_at = n, this.pubkeyRaw = i;
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
        return new Contact(e, n, i.created_at, i.author);
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
    parsedContent;
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
    parseContent(t = {
        httpUrl: !0,
        nostrUri: !0,
        tag: !1
    }) {
        return this.parsedContent || (t = parseContent({
            content: normolizeContent(this),
            tags: this.tags
        }, t), this.parsedContent = t);
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
        this.pubkey = t, this.lastUpdatedAt = n, this.name = e.name, this.display_name = e.display_name, 
        this.about = e.about, this.banner = e.banner, this.picture = e.picture, 
        this.nip05 = {
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
        } = e, r = this.pubkey;
        if (e) return e = {
            kinds: [ Kind.EncryptedDirectMessage ],
            authors: [ r, e ],
            "#p": [ e, r ],
            limit: i,
            until: n
        }, r = (await t.fetch([ e ])).map(async t => {
            t = EncryptedDirectMessage.from(t);
            return await t.decryptContent(this.keys), t;
        }), Promise.all(r);
        throw new Error("rescipients is required");
    }
    subscribe(t, e, n) {
        this.sub && this.sub.unsub();
        var {
            limit: n = 500,
            since: i
        } = n, r = this.pubkey, s = {
            kinds: [ Kind.EncryptedDirectMessage ],
            authors: [ r ],
            limit: n,
            since: i
        }, r = {
            kinds: [ Kind.EncryptedDirectMessage ],
            "#p": [ r ],
            limit: n,
            since: i
        };
        t.subscribe([ s, r ]).on("event", async t => {
            t = EncryptedDirectMessage.from(t);
            await t.decryptContent(this.keys), e(t);
        });
    }
}

function sortDesc(t) {
    return t.sort((t, e) => e.created_at - t.created_at);
}

function sortAsc(t) {
    return t.sort((t, e) => t.created_at - e.created_at);
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

async function fetchFollowers(t, e, n, i) {
    e = {
        kinds: [ KnownEventKind.CONTACT ],
        "#p": [ e ]
    };
    return n && (e.until = n), i && (e.limit = i), (await t.fetch([ e ])).map(t => Contact.from(t));
}

async function fetchFollowersAMAP(e, n, i, t = 3, r) {
    let s = 0, a = 0, o = [], c = now();
    do {
        let t;
        if (t = sortAsc(r ? await fetchFollowers(e, n, c, r) : await fetchFollowers(e, n, c)), 
        0 === (a = t.length)) break;
        o = t.concat(o), s++, c = t[0].created_at, i(t);
    } while (s < t && 0 < a);
    return o;
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
        this.followingPubkeysRaw = t;
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
        var r = now();
        await this.digging(t, n, e, r), this.sub4Incoming(t, i, 0, r - 1);
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
        const i = this.relays.length, r = this.pool.publish(this.relays, t);
        return new Promise((t, e) => {
            let n = 0;
            r.on("ok", () => {
                t();
            }), r.on("failed", t => {
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
        const i = await fetchRepliesOrdered(t, this.root.id, e, n), r = (i.forEach(t => {
            this.collection[t.id] = t;
        }), e => {
            i.filter(t => t.nip10.refer === e.id).forEach(t => {
                e.addReply(t), r(t);
            });
        });
        r(this.root);
    }
    unscrollReplies(t) {
        return this.collection[t.id] ? t.traverseNotes() : [];
    }
}

export {
    BaseEvent,
    Channel,
    ChannelMessage,
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
    encodeNPubKey,
    encodeNSecKey,
    fetchContact,
    fetchFollowers,
    fetchFollowersAMAP,
    fetchNotes,
    fetchProfiles,
    fetchReactions,
    fetchRepliesOrdered,
    fetchReposts,
    toBadgeAward,
    toBadgeDefinition,
    toBadgeProfile,
    toContact,
    toDM,
    toDelete,
    toMetadata,
    toNote,
    toReaction,
    toReply,
    toReport,
    toRepost,
    useFetchImplementation,
    Misc as utils
};
