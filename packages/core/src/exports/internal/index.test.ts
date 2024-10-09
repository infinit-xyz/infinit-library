import { expect, test } from 'vitest'

import * as internal from './index'

test('exports - internal/index: should match snapshot', () => {
  expect(Object.keys(internal)).toMatchSnapshot()
})
