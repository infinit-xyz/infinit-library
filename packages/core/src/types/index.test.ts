import { describe, expect, it } from 'vitest'

import * as index from './index'

describe('types/index.ts', () => {
  it('should match the snapshot', () => {
    expect(Object.keys(index)).toMatchSnapshot()
  })
})
