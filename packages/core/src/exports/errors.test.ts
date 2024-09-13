import { expect, test } from 'vitest'

import * as errors from './errors'

test('exports - errors: should match snapshot', () => {
  expect(Object.keys(errors)).toMatchInlineSnapshot(`
    [
      "FoundInvalidCachedTxError",
      "IncorrectCacheError",
      "ContractValidateError",
      "DirectoryNotFoundError",
      "InfinitWalletNotFoundError",
      "TransactionError",
      "ContractNotFoundError",
      "TxNotFoundError",
      "ValidateInputValueError",
      "ValueNotFoundError",
    ]
  `)
})
