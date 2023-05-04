import Note from 'src/model/Note'
const event = {
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

test('Test read into Note', () => {
    const note = new Note(event)
    console.log(note)
    expect(note.nip10.refer === '12fb302d5c729bfb20d1041430a2557207b5b26e0c8df5a3b18e60a3c047011d')
})
