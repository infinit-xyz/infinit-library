import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { ContractValidateError } from '@errors/index'

describe('ContractValidateError', () => {
  test('should match snapshot', () => {
    expect(new ContractValidateError('error')).toMatchInlineSnapshot(`
        [ContractValidateError: error

        ${coreName}: ${coreVersion}]
    `)
  })
})
