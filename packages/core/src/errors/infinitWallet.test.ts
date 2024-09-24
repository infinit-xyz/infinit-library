import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { InfinitWalletNotFoundError } from '@errors/index'

describe('InfinitWalletNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new InfinitWalletNotFoundError()).toMatchInlineSnapshot(`
        [InfinitWalletNotFoundError: InfinitWallet not found

        ${coreName}: ${coreVersion}]
    `)
  })
})
