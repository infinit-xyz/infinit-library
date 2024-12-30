import { describe, expect, test } from 'vitest'

import * as index from './index'

describe('actions/index.ts', () => {
  const exportedKeys = Object.keys(index)

  test('should export actions', () => {
    expect(exportedKeys).toContain('actions')
  })

  test('should export action class listed in actions', () => {
    const actions = Object.values(index['actions'])

    for (const action of actions) {
      expect(exportedKeys).toContain(action.actionClassName)
    }
  })

  test('should have pendle action', () => {
    const actionKeys = Object.keys(index['actions'])
    actionKeys.forEach((actionKey) => expect(actionKey).toContain('Pendle'))
  })
})
