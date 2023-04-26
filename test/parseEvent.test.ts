import { parseEvent} from "src/core/event/Event";

const eventForTest = {
    id: '748a41b264f4400acbb8f7190c0e367ad495796a108a6794ac65dd449a9bec6d',
    kind: 0,
    pubkey: '37de453082bcf1c662715efcec8bbc3eb159d443e3d901deddb95a78b9fd4c66',
    created_at: 1681973259,
    content: '{"name":"","about":"","display_name":""}',
    tags: [],
    sig: '03df828decf3dc731e4b7ae0af742827ed3594b9832fae88785c05b89849c7db63e47e16f3744131ee2482504889f54eb7f8e15632e5dad1b90e41653ba361ff'
  }

test('parse event', () => {
    const eventObj = parseEvent(eventForTest)
    console.log(eventObj)
    expect(1).toBe(1)
})