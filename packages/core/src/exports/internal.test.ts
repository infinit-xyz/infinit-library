import { expect, test } from 'vitest'

import * as internal from './internal'

test('exports - internal: should match snapshot', () => {
  expect(Object.keys(internal)).toMatchInlineSnapshot(`
    [
      "validateActionData",
      "zodAddress",
      "zodAddressNonZero",
    ]
  `)
})
