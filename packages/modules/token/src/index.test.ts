import * as index from './index'
import { describe, expect, test } from 'vitest'

describe('index.ts', () => {
  test('export: should match snapshot', () => {
    expect(Object.keys(index)).toMatchInlineSnapshot(`
    [
      "Registry",
      "actions",
    ]
  `)
  })
})
