// import { Thread } from "src/index";
import { fetchNotes, Thread } from 'src/index'
import { NostrClient } from 'src/index'
import WebSocket from 'ws'

import { settings } from '../testHelper/settings'
global.WebSocket = WebSocket as any
/**
 *  d35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039
 *    55b98d724ce6c8ebb048e299097e932752a4c379d551fd8dedd109b14f6224fc
 *      0cff6aca1b72edde2df3fb86eae49b3e68388e697b43c46f016aedc95f303146
 *        12fb302d5c729bfb20d1041430a2557207b5b26e0c8df5a3b18e60a3c047011d
 *          7c7877648293826d259e8274b3d88f2722cf9fa33b5dceeab478b671bbaf331b
 *    f9c7d364b4faf89beb6a1e55017f1319854c5f50268b16ab5804441c552209ce
 *    11ba62d47afaccb8fd9c566776b65e55ca62de006f043062105786f96d5c43b1
 *
 */

// test('fetch the root', async () => {
//     const client = new NostrClient(settings.relays)
//     const notes = await fetchNotes(client, ['d35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'])
//     console.log(notes)
//     expect(notes.length).toBe(1)
//     client.close()
// })

test('load and unscroll', async () => {
    const client = new NostrClient(settings.relays)
    const notes = await fetchNotes(client, ['d35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'])
    const root = notes[0]
    const thread = new Thread(root)
    await thread.loadReply(client)
    const pov = thread.unscrollReplies(
        thread.collection['d35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
    )
    console.log(
        pov.map((n) => ({
            id: n.id,
            refer: n.nip10.refer,
        })),
    )
    client.close()
})
