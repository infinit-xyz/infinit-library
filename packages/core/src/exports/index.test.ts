import { expect, test } from 'vitest'

import * as index from './index'

test('exports - index: should match snapshot', () => {
  expect(Object.keys(index)).toMatchInlineSnapshot(`
    [
      "InfinitWallet",
      "ContractProvider",
      "InfinitAction",
      "InfinitActionRecord",
      "InfinitCache",
      "InfinitCallback",
      "Action",
      "SubAction",
      "TxBuilder",
    ]
  `)
})
