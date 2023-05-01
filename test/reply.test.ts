import { Keys, toReply } from 'src/index'
import { BaseEvent } from 'src/index'
import NostrClient from 'src/periphery/NostrClient'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'
import { sleep } from '../testHelper/utils'
global.WebSocket = WebSocket as any

const keys = new Keys(settings.privkeyEncoded)

// const toEvent1 = {
//     content:
//         '测试一下 https://nostr.build/i/nostr.build_3a0b426858a13487ccaf34aabbfe4f2ccc361ef70a2615d66a1bcb472596fb76.png \n' +
//         '\n' +
//         '测试一下 https://nostr.build/i/nostr.build_1ce0168c74719e7473358208232ef556e7cd037146e50b30928828cd94b78ac6.png',
//     created_at: 1682316974,
//     id: 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039',
//     kind: 1,
//     pubkey: '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3',
//     sig: 'bbce8dfe944b7d51a74ecb0857e6c0a68e4281db9cd909d0f3e4bb57c24af53c1ad749e2725c8df7e4f1f4d9d561421137edaab53dcba9f75473075bc7e08401',
//     tags: [],
// }

// const toEvent2 = {
//     content: 'あっかい赤なんdんsんslしj',
//     created_at: 1682320672,
//     id: 'f9c7d364b4faf89beb6a1e55017f1319854c5f50268b16ab5804441c552209ce',
//     kind: 1,
//     pubkey: 'f8c42fd1e33523b37efc919bb46fdbd47377cde3941ffc374c5bc3eab23f9b80',
//     sig: 'aef9e3e47f29480eae24faf4669c206e00e16474e2590b1cdef2a4a25797916d503e1056465c90fd869a72aada55dba4a6251565c108df2e7483630c8705618f',
//     tags: [
//         ['e', 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
//         ['p', '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3'],
//     ],
// }

const toEvent3 = {
    content: 'ぇ死なないの',
    created_at: 1682320588,
    id: '7c7877648293826d259e8274b3d88f2722cf9fa33b5dceeab478b671bbaf331b',
    kind: 1,
    pubkey: 'f8c42fd1e33523b37efc919bb46fdbd47377cde3941ffc374c5bc3eab23f9b80',
    sig: 'f3243e8348426ca95f7bf2c51bff998299e6668a684ceae9001dbeb2e7ddc6b7615b8aedc06c66f2d0a6dff9b2fa47ff622fa43d5ca3804de84e3e467c4440c8',
    tags: [
        ['e', 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
        ['e', '12fb302d5c729bfb20d1041430a2557207b5b26e0c8df5a3b18e60a3c047011d'],
        ['p', '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'],
        ['p', '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3'],
    ],
}

test('Rely to an event', async () => {
    const client = new NostrClient(settings.relays)
    const to_event = new BaseEvent(toEvent3)
    const event = new BaseEvent()
    await event.modify(toReply, to_event, 'test reply: to level 2 child 1')
    event.signByKey(keys)
    console.log(event)
    await client.publish(event)
    await sleep(500)
    client.close()
})
