import { describe, expect, test } from 'vitest'

import { isBlockscout } from '../isBlockscout'

describe('isBlockscout', () => {
  test('etherscan', { retry: 3 }, async () => {
    expect(isBlockscout('https://api-sepolia.arbiscan.io/api')).resolves.toBe(false)
  })

  test('blockscout', { retry: 3 }, async () => {
    expect(isBlockscout('https://eth-holesky.blockscout.com/api')).resolves.toBe(true)
  })
})
