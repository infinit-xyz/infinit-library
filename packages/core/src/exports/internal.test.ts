import * as internal from './internal'
import { expect, test } from 'vitest'

test('exports - internal: should match snapshot', () => {
  expect(Object.keys(internal)).toMatchInlineSnapshot(`
    [
      "validateActionData",
      "zodAddress",
      "zodAddressNonZero",
    ]
  `)
})
