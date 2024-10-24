import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployInitCapitalAction, DeployInitCapitalParamsSchema } from '@actions/deployInitCapital'

export const actions = {
  init: {
    name: 'Deploy Init Capital',
    actionClassName: DeployInitCapitalAction.name,
    paramsSchema: DeployInitCapitalParamsSchema,
    signers: ['deployer', 'accessControlManagerOwner'],
  },
} satisfies InfinitActionRecord

export { DeployInitCapitalAction }
