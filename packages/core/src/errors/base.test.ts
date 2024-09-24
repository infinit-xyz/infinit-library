import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { BaseError } from '@errors/base'

describe('BaseError', () => {
  test('BaseError', () => {
    expect(BaseError).toBeDefined()

    expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
        [BaseError: An error occurred.

        ${coreName}: ${coreVersion}]
    `)

    expect(new BaseError('')).toMatchInlineSnapshot(`
        [BaseError: An error occurred.

        ${coreName}: ${coreVersion}]
    `)

    expect(new BaseError('', { details: 'details' })).toMatchInlineSnapshot(`
        [BaseError: An error occurred.

        Details: details
        ${coreName}: ${coreVersion}]
    `)

    expect(new BaseError('', { cause: new BaseError('error') })).toMatchInlineSnapshot(`
        [BaseError: An error occurred.

        ${coreName}: ${coreVersion}]
    `)
  })
})
