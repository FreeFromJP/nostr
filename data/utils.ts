import { relayInit } from 'nostr-tools'
import { BaseEvent } from 'src/core/event/Event'
import WebSocket from 'ws'

import { settings } from './settings'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.WebSocket = WebSocket

export async function pushEvent(event: BaseEvent) {
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
