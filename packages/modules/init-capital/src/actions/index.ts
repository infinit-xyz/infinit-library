import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployDoubleSlopeIRMsAction, DeployDoubleSlopeIRMsActionParamsSchema } from '@actions/deployDoubleSlopeIRMs'
import { DeployInitCapitalAction, DeployInitCapitalParamsSchema } from '@actions/deployInitCapital'

export const actions = {
  init: {
    name: 'Deploy Init Capital',
    actionClassName: DeployInitCapitalAction.name,
    paramsSchema: DeployInitCapitalParamsSchema,
    signers: ['deployer', 'accessControlManagerOwner'],
  },
  deployDoubleSlopeIRMs: {
    name: 'Deploy Double Slope IRMs',
    actionClassName: DeployDoubleSlopeIRMsAction.name,
    paramsSchema: DeployDoubleSlopeIRMsActionParamsSchema,
    signers: ['deployer'],
  },
} satisfies InfinitActionRecord

export { DeployDoubleSlopeIRMsAction, DeployInitCapitalAction }
