import { Keys } from 'src/core/account/Keys'

test('Test priv key paste', () => {
    const privKey = 'nsec1kk2tp8qw73rydtdnngn0arlsxjege84ln56j82h5ssppkv37eass4lcsjd'
    const keys = new Keys(privKey)
    expect(keys.privkey).toBe('b594b09c0ef44646adb39a26fe8ff034b28c9ebf9d3523aaf484021b323ecf61')
    expect(keys.encodedPrivkey()).toBe(privKey)
    expect(keys.pubkey).toBe('f7c1fb977450392671ab594f355f28c393c7b45594b0df61dab208cd6f7a75e3')
    expect(keys.encodedPubkey()).toBe('npub17lqlh9m52qujvudtt98n2hegcwfu0dz4jjcd7cw6kgyv6mm6wh3sg2mynq')
})

test('Test pub')
