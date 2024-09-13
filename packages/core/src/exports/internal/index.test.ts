import * as internal from './index'
import { expect, test } from 'vitest'

test('exports - internal/index: should match snapshot', () => {
  expect(Object.keys(internal)).toMatchInlineSnapshot(`
    [
      "validateActionData",
      "zodAddress",
      "zodAddressNonZero",
      "zodHex",
    ]
  `)
})
