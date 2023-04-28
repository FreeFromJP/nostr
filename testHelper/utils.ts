import { relayInit, SimplePool } from 'nostr-tools'
import { BaseEvent } from 'src/core/event/Event'
import { NostrClient } from 'src/index'
import WebSocket from 'ws'

import { settings } from './settings'

global.WebSocket = WebSocket as any

export async function pushEvent(event: BaseEvent) {
    //this is a simple push
    const relay = relayInit(settings.relays[0])
    relay.on('connect', () => {
        console.log(`connected to ${relay.url}`)
    })
    relay.on('error', () => {
        console.log(`failed to connect to ${relay.url}`)
    })
    await relay.connect()
    relay.publish(event)
    relay.close()
}

export async function pushEventByPool(event: BaseEvent) {
    const pool = new SimplePool()
    const relays = [settings.relays[0]]
    const pub = pool.publish(relays, event)
    const p = new Promise((resolve) => {
        pub.on('ok', () => {
            console.log('succeed')
            resolve(true)
        })
        pub.on('failed', () => {
            console.log('failed')
            resolve(false)
        })
    })
    const r = await p
    pool.close(relays)
    return r
}

export async function pushEventByClient(event: BaseEvent) {
    const client = new NostrClient(settings.relays)
    const r = await client.publish(event)
    client.close()
    return r
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
