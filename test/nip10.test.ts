import NIP10 from 'src/core/utils/Nip10'

const tags = [
    ['e', 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
    ['e', '12fb302d5c729bfb20d1041430a2557207b5b26e0c8df5a3b18e60a3c047011d'],
    ['p', '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb'],
    ['p', '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3'],
]

// const tags = [
//     ['e', 'd35f33c19a6ed2a10d12a137c1aa4c72f14214701b4807e6d0fc26dc8a2dd039'],
//     ['p', '086174a3e2631dabdea2287e3f17d338b13507268e189821240e46b12c6044e3'],
// ]

test('tagsToNip10', () => {
    const nip10 = new NIP10(tags)
    console.log(nip10)
    // expect(nip10.root).toBe(tags[0][1])
    // expect(nip10.refer).toBe(tags[0][1])
})

test('nip10ToTags', () => {
    const nip10 = new NIP10(tags)
    const t = nip10.toTags()
    console.log(t)
    expect(t.length).toBe(tags.length)
})
