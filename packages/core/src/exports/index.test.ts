import { expect, test } from 'vitest'

import * as index from './index'

test('exports - index: should match snapshot', () => {
  expect(Object.keys(index)).toMatchSnapshot()
})
