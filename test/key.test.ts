import { Keys } from 'src/core/account/Keys'

import { settings } from './settings'

test('Test priv key paste', () => {
    const keys = new Keys(settings.privkeyEncoded)
    expect(keys.privkey).toBe(settings.prikey)
    expect(keys.encodedPrivkey()).toBe(settings.privkeyEncoded)
    expect(keys.pubkey).toBe(settings.pubkey)
    expect(keys.encodedPubkey()).toBe(settings.pubkeyEncoded)
    expect(keys.canSign()).toBe(true)
})

test('Test pub key paste', () => {
    const keys = new Keys(settings.pubkeyEncoded)
    expect(keys.privkey).toBe('')
    expect(keys.encodedPrivkey()).toBe('')
    expect(keys.pubkey).toBe(settings.pubkey)
    expect(keys.encodedPubkey()).toBe(settings.pubkeyEncoded)
    expect(keys.canSign()).toBe(false)
})
