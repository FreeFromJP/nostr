import type { Event, Filter } from 'nostr-tools'

import { BaseEvent } from '../event/Event'
import Observable from './Observable'

export const enum CloseAfter {
    SINGLE = 'single',
    EOSE = 'eose',
    NEVER = 'never',
}

export class Subscription extends Observable {
    constructor(relay: Relay, subId: string, closeAfter: CloseAfter) {
        super()
        this.relay = relay
        this.subId = subId
        this.closeAfter = closeAfter
    }
    relay: Relay
    subId: string
    closeAfter: CloseAfter

    closed = false
    eoseSeen = false

    close() {
        if (this.closed) return
        this.closed = true
        this.relay.unsubscribe(this.subId)
        this.emit('close', this.relay, this.subId)
    }

    onEvent(ev: Event) {
        const event = new BaseEvent(ev)
        if (!event.validate()) {
            // TODO Close relay?
            console.error(`Invalid event from ${this.relay}`, event)
            return
        }

        this.emit('event', event, this.relay, this.subId)

        if (this.closeAfter === CloseAfter.SINGLE) {
            this.close()
        }
    }

    onEose() {
        this.emit('eose', this.relay, this.subId)

        if (this.closeAfter === CloseAfter.EOSE) {
            this.close()
        }
    }
}

export class Relay extends Observable {
    constructor(url: string, opts?: ReconnectingWebSocket.Options) {
        super()
        this.url = url

        this.socket = new ReconnectingWebSocket(url, opts)
        this.socket.on('open', this.emit.bind(this, 'open', this))
        this.socket.on('close', this.emit.bind(this, 'close', this))
        this.socket.on('error', this.emit.bind(this, 'error', this))
        this.socket.on('message', this.onMessage.bind(this))
    }

    url = ''
    socket: ReconnectingWebSocket
    subs: { [subId: string]: Subscription } = {}
    nextSubId = 0

    connect() {
        this.socket.connect()
    }

    disconnect() {
        this.socket.disconnect()
    }

    isConnected() {
        return this.socket.isConnected()
    }

    publish(event: Event) {
        return new Promise((resolve) => {
            if (!this.socket.send(['EVENT', event])) {
                return resolve(false)
            }

            let timeout: ReturnType<typeof setTimeout> = null as any
            const callback = (eventId: string, wasSaved: boolean) => {
                if (eventId === event.id && wasSaved) {
                    clearTimeout(timeout)
                    this.off('ok', callback)
                    resolve(true)
                }
            }
            timeout = setTimeout(() => {
                this.off('ok', callback)
                resolve(false)
            }, 4000) // TODO: make this a parameter

            this.on('ok', callback)
        })
    }

    subscribe(filters: Filter, subId: string, closeAfter = CloseAfter.NEVER) {
        console.log('Relay.js------------subscribe----------')
        if (!subId) subId = `sub${this.nextSubId++}`
        const sub = new Subscription(this, subId, closeAfter)
        this.subs[subId] = sub
        this.socket.send(['REQ', subId, filters])
        console.log('REQ------------REQ----------', sub)
        return sub
    }

    unsubscribe(subId: string) {
        if (!this.subs[subId]) return
        delete this.subs[subId]
        this.socket.send(['CLOSE', subId])
    }

    onMessage(event: any) {
        try {
            this.processMessage(event.data)
        } catch (e: any) {
            // TODO: Remove this relay?
            console.error(`Invalid message from ${this.url}: ${e.message || e}`, event.data, e)
        }
    }

    processMessage(msg: string) {
        let array
        try {
            array = JSON.parse(msg)
        } catch (e: any) {
            throw new Error(`not a nostr message: ${e.message || e}`)
        }

        if (!Array.isArray(array) || !array.length) {
            throw new Error('not a nostr message')
        }

        const type = array[0]
        switch (type) {
            case 'EVENT': {
                Relay.enforceArrayLength(array, 3)
                // @typescript-eslint/no-unused-vars
                const [_, subId, event] = array

                const sub = this.subs[subId]
                if (sub) sub.onEvent(event)

                // still needed?
                this.emit('event', subId, event)
                break
            }
            case 'EOSE': {
                Relay.enforceArrayLength(array, 2)
                // @typescript-eslint/no-unused-vars
                const [_, subId] = array

                const sub = this.subs[subId]
                if (sub) sub.onEose()

                // still needed?
                this.emit('eose', subId)
                break
            }
            case 'NOTICE': {
                Relay.enforceArrayLength(array, 2)
                // @typescript-eslint/no-unused-vars
                const [_, payload] = array
                this.emit('notice', payload)
                break
            }
            case 'OK': {
                Relay.enforceArrayLength(array, 4)
                // @typescript-eslint/no-unused-vars
                const [_, eventId, wasSaved, message] = array
                this.emit('ok', eventId, wasSaved, message)
                break
            }
            default:
                throw new Error(`unknown message type '${type}'`)
        }
    }

    static enforceArrayLength(array: string[], length: number) {
        if (array.length !== length) {
            throw new Error(`unexpected length (expected ${length}, got ${array.length})`)
        }
        if (array.some((elem) => elem === undefined)) {
            throw new Error(`required element missing (${length} needed)`)
        }
    }

    toString() {
        return this.url
    }
}

namespace ReconnectingWebSocket {
    export type Options = {
        reconnect?: boolean
        reconnectAfter?: number
    }
}

class ReconnectingWebSocket extends Observable {
    constructor(url: string, opts?: ReconnectingWebSocket.Options) {
        super()
        this.url = url
        if (opts) {
            this.opts = Object.assign(
                {
                    reconnect: true,
                    reconnectAfter: 3000,
                },
                opts,
            )
        }

        this.reconnectAfter = this.opts.reconnectAfter
    }

    url = ''
    opts: ReconnectingWebSocket.Options & {
        reconnect: boolean
        reconnectAfter: number
    } = {
        reconnect: true,
        reconnectAfter: 3000,
    }
    socket: WebSocket | null = null
    disconnected = false
    reconnectAfter = 3000
    reconnectTimer: ReturnType<typeof setTimeout> | null = null

    connect() {
        if (this.isConnected()) return
        this.disconnected = false
        this.reconnectTimer = null

        const ws = new WebSocket(this.url)
        ws.onopen = this.onOpen.bind(this)
        ws.onclose = this.onClose.bind(this)
        ws.onerror = this.onError.bind(this)
        ws.onmessage = this.onMessage.bind(this)
        this.socket = ws
    }

    disconnect() {
        this.disconnected = true
        this.close()
    }

    reconnect() {
        if (this.disconnected || this.reconnectTimer) return

        console.log(`[RELAY] Scheduling reconnect to ${this.url} in ${this.reconnectAfter}ms`)
        this.reconnectTimer = setTimeout(() => {
            console.log(`[RELAY] Reconnecting to ${this.url} now`)
            this.reconnectTimer = null
            this.connect()
        }, this.reconnectAfter)

        this.reconnectAfter = Math.min((this.reconnectAfter *= 2), 1000 * 60 * 5)
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN
    }

    close() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('this.socket.close', this.socket.close)
            this.socket.close()
        }
        this.socket = null
    }

    send(message: any) {
        // TODO Wait for connected?
        if (!this.isConnected() || this.socket === null) {
            console.warn(`Not connected to ${this.url} (currently ${this.socket?.readyState})`)
            return false
        }

        try {
            this.socket.send(JSON.stringify(message))
            return true
        } catch (e) {
            return false
        }
    }

    onOpen() {
        this.emit('open', this)
        console.log('Connected to relay', this.url)
        this.reconnectAfter = this.opts.reconnectAfter
    }

    onClose() {
        this.close()
        this.emit('close', this)
        if (this.opts.reconnect) this.reconnect()
    }

    onError(error: any) {
        console.log(`Socket error from relay ${this.url}`, error)
        this.emit('error', error, this)

        if (!this.isConnected()) {
            this.close()
            if (this.opts.reconnect) this.reconnect()
        }
    }

    onMessage(message: any) {
        this.emit('message', message, this)
    }
}
