import 'websocket-polyfill'

import { relayInit, SimplePool } from 'nostr-tools'
import { BaseEvent } from 'src/core/event/Event'

import { settings } from './settings'

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
    pub.on('ok', () => {
        console.log('succeed')
    })
    pub.on('failed', () => {
        console.log('failed')
    })
    pool.close(relays)
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
