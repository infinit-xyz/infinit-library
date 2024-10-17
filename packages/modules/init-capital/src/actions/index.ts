import { z } from 'zod'

import { InfinitActionRecord } from '@infinit-xyz/core'

// remove this
class MockAction {}

export const actions = {
  init: {
    name: 'UPDATE THIS',
    actionClassName: MockAction.name,
    paramsSchema: z.object({}),
    signers: ['deployer'],
  },
} satisfies InfinitActionRecord

export { MockAction }
