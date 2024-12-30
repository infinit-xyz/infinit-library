import { ActionDetailRecord } from '@infinit-xyz/core'

import { DeployPendleAction, DeployPendleActionParamsSchema } from '@actions/deployPendle'

export const actions = {
  DeployPendle: {
    type: 'on-chain',
    name: 'Deploy Pendle V3',
    actionClassName: DeployPendleAction.name,
    paramsSchema: DeployPendleActionParamsSchema,
    signers: ['deployer'],
  },
} satisfies ActionDetailRecord

export { DeployPendleAction }
