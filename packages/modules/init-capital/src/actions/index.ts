import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployDoubleSlopeIRMsAction, DeployDoubleSlopeIRMsActionParamsSchema } from '@actions/deployDoubleSlopeIRMs'
import { DeployInitCapitalAction, DeployInitCapitalActionParamsSchema } from '@actions/deployInitCapital'
import { SetIrmAction, SetIrmActionParamsSchema } from '@actions/setIrm'
import { SetMaxPriceDeviationAction, SetMaxPriceDeviationActionParamsSchema } from '@actions/setMaxPriceDeviation'
import { SetModeStatusAction, SetModeStatusActionParamsSchema } from '@actions/setModeStatus'
import { SetPoolConfigAction, SetPoolConfigParamsSchema } from '@actions/setPoolConfig'

export const actions = {
  init: {
    name: 'Deploy INIT Capital',
    actionClassName: DeployInitCapitalAction.name,
    paramsSchema: DeployInitCapitalActionParamsSchema,
    signers: ['deployer', 'accessControlManagerOwner'],
  },
  deployDoubleSlopeIRMs: {
    name: 'Deploy Double Slope IRMs',
    actionClassName: DeployDoubleSlopeIRMsAction.name,
    paramsSchema: DeployDoubleSlopeIRMsActionParamsSchema,
    signers: ['deployer'],
  },
  setIrm: {
    name: 'Set IRM',
    actionClassName: SetIrmAction.name,
    paramsSchema: SetIrmActionParamsSchema,
    signers: ['guardian'],
  },
  setModeStatus: {
    name: 'Set Mode Status',
    actionClassName: SetModeStatusAction.name,
    paramsSchema: SetModeStatusActionParamsSchema,
    signers: ['guardian'],
  },
  setPoolConfig: {
    name: 'Set Pool Config',
    actionClassName: SetPoolConfigAction.name,
    paramsSchema: SetPoolConfigParamsSchema,
    signers: ['guardian'],
  },
  SetMaxPriceDeviations: {
    name: 'Set Max Price Deviation',
    actionClassName: SetMaxPriceDeviationAction.name,
    paramsSchema: SetMaxPriceDeviationActionParamsSchema,
    signers: ['governor'],
  },
} satisfies InfinitActionRecord

export { DeployDoubleSlopeIRMsAction, DeployInitCapitalAction, SetIrmAction, SetModeStatusAction, SetPoolConfigAction }
