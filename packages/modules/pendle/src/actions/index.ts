import { ActionDetailRecord } from '@infinit-xyz/core'

import { DeployPendleV3Action, DeployPendleV3ActionParamsSchema } from '@actions/deployPendleV3'

export const actions = {
  DeployPendleV3: {
    type: 'on-chain',
    name: 'Deploy Pendle V3',
    actionClassName: DeployPendleV3Action.name,
    paramsSchema: DeployPendleV3ActionParamsSchema,
    signers: ['deployer'],
  },
} satisfies ActionDetailRecord

export { DeployPendleV3Action }
