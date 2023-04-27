import { Event, Filter } from 'nostr-tools'
import Observable from 'src/core/relay/Observable'
import type { Subscription } from 'src/core/relay/Relay'
import { CloseAfter, Relay } from 'src/core/relay/Relay'

class MultiSubscription extends Observable {
    constructor(subId: string, subs: Subscription[]) {
        super()
        this.subId = subId
        for (const sub of subs) {
            this.subs[sub.relay.url] = sub
            this.setupListeners(sub)
        }
    }

    subId = ''
    subs: { [relayUrl: string]: Subscription } = {}

    setupListeners(sub: Subscription) {
        sub.on('event', this.emit.bind(this, 'event'))
        sub.on('eose', this.onEose.bind(this))
        sub.on('close', this.onClose.bind(this))
    }

    add(sub: Subscription) {
        console.assert(sub.subId === this.subId, 'invalid subId')
        this.subs[sub.relay.url] = sub
        this.setupListeners(sub)
    }

    close(relay?: Relay) {
        if (relay) {
            const k = relay.url
            if (this.subs[k]) this.subs[k].close()
            return
        }

        for (const sub of Object.values(this.subs)) {
            sub.close()
        }
    }

    onEose(relay: Relay) {
        const sub = this.subs[relay.url]
        if (!sub) return

        // still needed?
        this.emit('eose', relay, this.subId)

        if (!sub.eoseSeen) {
            sub.eoseSeen = true
            if (Object.values(this.subs).every((sub) => sub.eoseSeen)) {
                this.emit('end', this.subId)
            }
        }
    }

    onClose(relay: Relay) {
        delete this.subs[relay.url]
        if (Object.keys(this.subs).length === 0) {
            this.emit('close', this.subId)
        }
    }
}

export default class ReplayPool extends Observable {
    constructor(urls: string[], minRelays = 5) {
        super()

        this.minRelays = Math.min(minRelays, urls.length)

        for (const url of urls) {
            this.add(url)
        }
    }

    relays: { [url: string]: Relay } = {}
    subs: {
        [subId: string]: {
            sub: MultiSubscription
            filters: Filter[]
            closeAfter: CloseAfter
            pending: boolean
        }
    } = {}
    nextSubId = 0
    minRelays = 0

    add(url: string) {
        if (this.relays[url]) return

        const relay = new Relay(url)
        relay.on('open', this.onOpen.bind(this))
        relay.on('close', this.emit.bind(this, 'close', relay))

        relay.on('event', this.emit.bind(this, 'event', relay))
        relay.on('eose', this.emit.bind(this, 'eose', relay))
        relay.on('notice', this.emit.bind(this, 'notice', relay))
        relay.on('ok', this.emit.bind(this, 'ok', relay))

        this.relays[url] = relay
    }

    remove(url: string) {
        const relay = this.relays[url]
        if (!relay) return
        relay.disconnect()
        delete this.relays[url]
    }

    async publish(event: Event) {
        const promises = []
        for (const relay of this.connectedRelays()) {
            promises.push(relay.publish(event))
        }
        return Promise.all(promises)
            .then((results) => results.filter((res) => res).length)
            .catch((e) => {
                console.error('Error while publishing', e)
                return 0
            })
    }

    subscribe(filters: Filter[], subId: string | null = null, closeAfter = CloseAfter.NEVER) {
        if (!subId) subId = `sub${this.nextSubId++}`

        const sub = new MultiSubscription(subId, [])
        sub.on('close', this.unsubscribe.bind(this, subId))

        this.subs[subId] = {
            sub,
            filters,
            closeAfter,
            pending: false,
        }
        const connectedRelays = this.connectedRelays()

        if (connectedRelays.length >= this.minRelays) {
            for (const relay of connectedRelays) {
                sub.add(relay.subscribe(filters, subId, closeAfter))
            }
        } else {
            this.subs[subId].pending = true
        }

        return sub
    }

    unsubscribe(subId: string) {
        const sub = this.subs[subId]
        if (!sub) return
        sub.sub.close()
        delete this.subs[subId]
    }

    connect() {
        for (const relay of Object.values(this.relays)) {
            relay.connect()
        }
    }

    disconnect() {
        for (const relay of Object.values(this.relays)) {
            relay.disconnect()
        }
    }

    connectedRelays() {
        return Object.values(this.relays).filter((relay) => relay.isConnected())
    }

    numConnectedRelays() {
        return this.connectedRelays().length
    }

    onOpen(relay: Relay) {
        for (const subId of Object.keys(this.subs)) {
            const sub = this.subs[subId]
            const connectedRelays = this.connectedRelays()
            if (connectedRelays.length >= this.minRelays) {
                if (sub.pending) {
                    sub.pending = false
                    for (const relay of connectedRelays) {
                        sub.sub.add(relay.subscribe(sub.filters, subId, sub.closeAfter))
                    }
                } else {
                    sub.sub.add(relay.subscribe(sub.filters, subId, sub.closeAfter))
                }
            }
        }

        this.emit('open', relay)
    }
}
