import { Kind } from 'nostr-tools'
import { nip04 } from 'nostr-tools'
import { now } from 'src/core/utils/Misc'
import { Keys } from 'src/index'
import EncryptedDirectMessage from 'src/model/EncryptedDirectMessage'

import { settings } from '../testHelper/settings'

describe('EncryptedDirectMessage', () => {
    test('should return a kind-4 blank event', () => {
        const t = now()
        const dm = new EncryptedDirectMessage({
            recipients: settings.pubkey,
            plaintext: 'hello world',
        })

        expect(dm).toEqual({
            kind: Kind.EncryptedDirectMessage,
            plaintext: 'hello world',
            tags: [['p', settings.pubkey]],
            recipients: settings.pubkey,
            content: '',
            created_at: t,
            id: '',
            sig: '',
            pubkey: '',
        })
    })

    it('should return encrypted direct message from a event', () => {
        const dm = EncryptedDirectMessage.from({
            id: '92854423f3d52baf34e14a1ae487259cafd32e159ffa4007873238b9b1731595',
            kind: Kind.EncryptedDirectMessage,
            pubkey: 'ce9a2d19a1aee7787074cdd8cd9688d154f2943aa7393bd9d60958afe64b9e26',
            created_at: 1682923292,
            content: '3D1ubDPhfUYdEBmb5YillO7Ee/HIWUw4CHU+gHFQg5o=?iv=bQaeKxV9RXoTe+UX+u50ag==',
            tags: [['p', '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb']],
            sig: 'b2e201c37129311d1d333c5c3ddcbc7903c168fe29b98f27c8e5d06a3ad623f399fb3b5bc4aeabf22f3ee0c20760c7b8447363fd12b2440c06591e5d04d9add3',
        })
        expect(dm).toEqual({
            plaintext: '',
            recipients: '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb',
            id: '92854423f3d52baf34e14a1ae487259cafd32e159ffa4007873238b9b1731595',
            kind: Kind.EncryptedDirectMessage,
            pubkey: 'ce9a2d19a1aee7787074cdd8cd9688d154f2943aa7393bd9d60958afe64b9e26',
            created_at: 1682923292,
            content: '3D1ubDPhfUYdEBmb5YillO7Ee/HIWUw4CHU+gHFQg5o=?iv=bQaeKxV9RXoTe+UX+u50ag==',
            tags: [['p', '6961db6aec05b27aa1db28b96b0130e6805c357e47d731533ec4ac97e5fcbebb']],
            sig: 'b2e201c37129311d1d333c5c3ddcbc7903c168fe29b98f27c8e5d06a3ad623f399fb3b5bc4aeabf22f3ee0c20760c7b8447363fd12b2440c06591e5d04d9add3',
        })
    })

    it('should return a unsigned event', () => {
        const t = now()

        const dm = new EncryptedDirectMessage({
            recipients: settings.pubkey,
            plaintext: 'hello world',
        })
        const event = dm.toUnsignedEvent()
        expect(event).toEqual({
            kind: Kind.EncryptedDirectMessage,
            content: '',
            tags: [['p', settings.pubkey]],
            created_at: t,
            pubkey: '',
            sig: '',
            id: '',
        })
    })

    it('should encrypt and decrypt message', async () => {
        const recipientsPubkey = settings.pubkey
        const recipientsPrikey = settings.prikey

        const authorPubkey = settings.pubkey2
        // const authorPrikey = settings.prikey2
        const authorPrikeyNesc = settings.privkeyEncoded2

        const dm = new EncryptedDirectMessage({
            recipients: recipientsPubkey,
            plaintext: 'hello world',
        })

        const keys = new Keys(authorPrikeyNesc)
        await dm.encryptContent(keys)

        const plaintext = await nip04.decrypt(recipientsPrikey, authorPubkey, dm.content)

        expect(dm.plaintext).toEqual(plaintext)
    })
})
