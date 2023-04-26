import WebSocket from 'ws'
import { Event } from 'src/core/event/Event'
import { relayInit } from 'nostr-tools'
import { settings } from './settings'

//@ts-ignore
global.WebSocket = WebSocket

export async function pushEvent(event: Event) {
    //this is a simple push
    const relay = relayInit(settings.relay1)
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