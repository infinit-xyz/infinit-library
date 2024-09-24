import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { DirectoryNotFoundError } from '@errors/index'

describe('DirectoryNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new DirectoryNotFoundError('path')).toMatchInlineSnapshot(`
        [DirectoryNotFoundError: path not found

        ${coreName}: ${coreVersion}]
    `)
  })
})
