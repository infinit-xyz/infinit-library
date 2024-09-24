import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { ValidateInputValueError, ValueNotFoundError } from '@errors/index'

describe('ValidateInputValueError', () => {
  test('should match snapshot', () => {
    expect(new ValidateInputValueError()).toMatchInlineSnapshot(`
        [ValidateInputValueError: Please check your input params

        ${coreName}: ${coreVersion}]
    `)

    expect(new ValidateInputValueError('extra error')).toMatchInlineSnapshot(`
        [ValidateInputValueError: Please check your input params
        extra error

        ${coreName}: ${coreVersion}]
    `)
  })
})

describe('ValueNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new ValueNotFoundError()).toMatchInlineSnapshot(`
        [ValueNotFoundError: Please check your input params

        ${coreName}: ${coreVersion}]
    `)

    expect(new ValueNotFoundError('extra error')).toMatchInlineSnapshot(`
        [ValueNotFoundError: Please check your input params
        extra error

        ${coreName}: ${coreVersion}]
    `)
  })
})
