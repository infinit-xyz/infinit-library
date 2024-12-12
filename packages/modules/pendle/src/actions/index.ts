import { z } from 'zod'

import { ActionDetailRecord } from '@infinit-xyz/core'

export const actions = {
  init: {
    type: 'on-chain',
    name: 'Deploy ERC20 Token',
    actionClassName: 'fix me',
    paramsSchema: z.object({}),
    signers: ['deployer'],
  },
} satisfies ActionDetailRecord

export {}
