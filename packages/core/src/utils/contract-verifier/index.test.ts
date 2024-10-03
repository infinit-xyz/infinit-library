import { describe, expect, test } from 'vitest'

import * as index from './index'

describe('utils/verifier/index.ts', () => {
  test('export: should match snapshot', () => {
    expect(Object.keys(index)).toMatchSnapshot()
  })
})
