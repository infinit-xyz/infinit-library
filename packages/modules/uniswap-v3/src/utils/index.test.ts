import { describe, expect, test } from 'vitest'

import * as index from './index'

describe('index.ts', () => {
  test('export: should match snapshot', () => {
    expect(Object.keys(index)).toMatchSnapshot()
  })
})
