import { getOptionalTagValueByName } from 'src/core/utils/Misc'
import { BadgeDefinition } from 'src/model/Badge'

test('misc utility testing', () => {
    const testTags = [
        ['e', '123'],
        ['e', '456'],
        ['p', 'p1'],
        ['p', 'p2'],
        ['name', 'name 1'],
        ['desc', 'desc 1'],
        ['desc', 'desc 2', 'desc 2-2'],
    ]
    const r = getOptionalTagValueByName(testTags, 'e', 'p', 'desc', 'nameNotExist')
    const [a, b, c, d] = r
    expect(r).toHaveLength(4)
    expect(a).toHaveLength(2)
    expect(b).toHaveLength(2)
    expect(a[0]).toHaveLength(1)
    expect(a[0][0]).toBe('123')
    expect(a[1]).toHaveLength(1)
    expect(c[1][0]).toBe('desc 2')
    expect(c[1][1]).toBe('desc 2-2')
    expect(d).toHaveLength(0)
    expect(d).toBeInstanceOf(Array)
})

test('parse badge definition from event', () => {
    const demoEvent = {
        content: '',
        created_at: 1682320588,
        id: '7c7877648293826d259e8274b3d88f2722cf9fa33b5dceeab478b671bbaf331b',
        kind: 30009,
        pubkey: 'f8c42fd1e33523b37efc919bb46fdbd47377cde3941ffc374c5bc3eab23f9b80',
        sig: 'f3243e8348426ca95f7bf2c51bff998299e6668a684ceae9001dbeb2e7ddc6b7615b8aedc06c66f2d0a6dff9b2fa47ff622fa43d5ca3804de84e3e467c4440c8',
        tags: [
            ['e', 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
            ['e', '12fb302d5c729bfb20d1041430a2557207b5b26e0c8df5a3b18e60a3c047011d'],
            ['p', '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'],
            ['p', '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3'],
            ['d', 'Public Sponsor'],
            ['name', 'Medal of Bravery'],
            ['description', 'Awarded to users demonstrating bravery'],
            ['image', 'https://nostr.academy/awards/bravery.png', '1024x1024'],
            ['thumb', 'https://nostr.academy/awards/bravery_256x256.png', '256x256'],
            ['thumb', 'https://nostr.academy/awards/bravery_128x128.png'],
        ],
    }
    const demoBadgeDef = BadgeDefinition.fromEvent(demoEvent)
    expect(demoBadgeDef !== undefined).toBe(true)
    expect(demoBadgeDef?.id).toBe('Public Sponsor')
    expect(demoBadgeDef?.name).toBe('Medal of Bravery')
    expect(demoBadgeDef?.description).toBe('Awarded to users demonstrating bravery')

    expect(demoBadgeDef?.highResImage?.url).toBe('https://nostr.academy/awards/bravery.png')
    expect(demoBadgeDef?.highResImage?.width).toBe(1024)
    expect(demoBadgeDef?.highResImage?.height).toBe(1024)

    expect(demoBadgeDef?.thumbList[0].url).toBe('https://nostr.academy/awards/bravery_256x256.png')
    expect(demoBadgeDef?.thumbList[0].width).toBe(256)
    expect(demoBadgeDef?.thumbList[0].height).toBe(256)

    expect(demoBadgeDef?.thumbList[1].url).toBe('https://nostr.academy/awards/bravery_128x128.png')
    expect(demoBadgeDef?.thumbList[1].width).toBe(undefined)
    expect(demoBadgeDef?.thumbList[1].height).toBe(undefined)
})
