import { Keys } from 'src/core/account/Keys'

import { settings } from '../testHelper/settings'

test('Test priv key paste', () => {
    const keys = new Keys(settings.privkeyEncoded)
    expect(keys.privkeyRaw).toBe(settings.prikey)
    expect(keys.privkey()).toBe(settings.privkeyEncoded)
    expect(keys.pubkeyRaw).toBe(settings.pubkey)
    expect(keys.pubkey()).toBe(settings.pubkeyEncoded)
    expect(keys.canSign()).toBe(true)
})

test('Test pub key paste', () => {
    const keys = new Keys(settings.pubkeyEncoded)
    expect(keys.privkeyRaw).toBe('')
    expect(keys.privkey()).toBe('')
    expect(keys.pubkeyRaw).toBe(settings.pubkey)
    expect(keys.pubkey()).toBe(settings.pubkeyEncoded)
    expect(keys.canSign()).toBe(false)
})

test('Test raw priv key', () => {
    const keys = new Keys({
        privkey: settings.prikey,
    })
    expect(keys.privkeyRaw).toBe(settings.prikey)
    expect(keys.pubkeyRaw).toBe(settings.pubkey)
    expect(keys.pubkey()).toBe(settings.pubkeyEncoded)
    expect(keys.privkey()).toBe(settings.privkeyEncoded)
})
