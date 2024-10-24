import { describe, expect, test } from 'vitest'

import * as index from './index'

describe('off-chain-actions/index.ts', () => {
  const exportedKeys = Object.keys(index)

  test('should export offChainActions', () => {
    expect(exportedKeys).toContain('offChainActions')
  })

  test('should export action class listed in offChainActions', () => {
    const actions = Object.values(index['offChainActions'])

    for (const action of actions) {
      expect(exportedKeys).toContain(action.offChainActionClassName)
    }
  })
})
