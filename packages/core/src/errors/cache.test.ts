import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { FoundInvalidCachedTxError, IncorrectCacheError } from '@errors/index'

describe('FoundInvalidCachedTxError', () => {
  test('should match snapshot', () => {
    expect(new FoundInvalidCachedTxError()).toMatchInlineSnapshot(`
        [FoundInvalidCachedTxError: Found a successful Tx after a failed Tx, please contract support

        ${coreName}: ${coreVersion}]
    `)
  })
})

describe('IncorrectCacheError', () => {
  test('should match snapshot', () => {
    expect(new IncorrectCacheError()).toMatchInlineSnapshot(`
        [IncorrectCacheError: Found a cache but the cache is incorrect
        Reason: None

        ${coreName}: ${coreVersion}]
    `)

    expect(new IncorrectCacheError('reason')).toMatchInlineSnapshot(`
        [IncorrectCacheError: Found a cache but the cache is incorrect
        Reason: reason

        ${coreName}: ${coreVersion}]
    `)
  })
})
