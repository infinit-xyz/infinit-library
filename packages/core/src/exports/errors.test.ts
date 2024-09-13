import * as errors from './errors'
import { expect, test } from 'vitest'

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
