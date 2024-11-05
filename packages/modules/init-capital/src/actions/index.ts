import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployApi3ProxyOracleReaderAction, DeployApi3ProxyOracleReaderActionParamsSchema } from '@actions/deployApi3ProxyOracleReader'
import { DeployDoubleSlopeIRMsAction, DeployDoubleSlopeIRMsActionParamsSchema } from '@actions/deployDoubleSlopeIRMs'
import { DeployInitCapitalAction, DeployInitCapitalActionParamsSchema } from '@actions/deployInitCapital'
import { DeployPythOracleReaderAction, DeployPythOracleReaderActionParamsSchema } from '@actions/deployPythOracleReader'
import { SetApi3ProxyOracleReaderTokensInfoAction, SetApi3ProxyOracleReaderTokensInfoActionParamsSchema } from '@actions/setApi3ProxyOracleReaderTokensInfo'
import { SetIrmAction, SetIrmActionParamsSchema } from '@actions/setIrm'
import { SetMaxPriceDeviationAction, SetMaxPriceDeviationActionParamsSchema } from '@actions/setMaxPriceDeviation'
import { SetModeStatusAction, SetModeStatusActionParamsSchema } from '@actions/setModeStatus'
import { SetOracleAction, SetOracleActionParamsSchema } from '@actions/setOracle'
import { SetPoolConfigAction, SetPoolConfigParamsSchema } from '@actions/setPoolConfig'
import {
  SetPythOracleReaderTokensInfoAction,
  SetPythOracleReaderTokensInfoActionParamsSchema,
} from '@actions/setPythOracleReaderTokensInfo'

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
  setOracle: {
    name: 'Set Oracle',
    actionClassName: SetOracleAction.name,
    paramsSchema: SetOracleActionParamsSchema,
    signers: ['governor'],
  },
  setMaxPriceDeviations: {
    name: 'Set Max Price Deviation',
    actionClassName: SetMaxPriceDeviationAction.name,
    paramsSchema: SetMaxPriceDeviationActionParamsSchema,
    signers: ['governor'],
  },
  deployApi3ProxyOracleReader: {
    name: 'Deploy Api3 Proxy Oracle Reader',
    actionClassName: DeployApi3ProxyOracleReaderAction.name,
    paramsSchema: DeployApi3ProxyOracleReaderActionParamsSchema,
    signers: ['deployer'],
  },
  setApi3ProxyOracleReaderTokensInfo: {
    name: 'Set Api3 Proxy Oracle Reader Tokens Info Action',
    actionClassName: SetApi3ProxyOracleReaderTokensInfoAction.name,
    paramsSchema: SetApi3ProxyOracleReaderTokensInfoActionParamsSchema,
    signers: ['governor'],
  },
  deployPythOracleReader: {
    name: 'Deploy Pyth Oracle Reader',
    actionClassName: DeployPythOracleReaderAction.name,
    paramsSchema: DeployPythOracleReaderActionParamsSchema,
    signers: ['deployer'],
  },
  setPythOracleReaderTokensInfo: {
    name: 'Set Pyth Oracle Reader Tokens Info',
    actionClassName: SetPythOracleReaderTokensInfoAction.name,
    paramsSchema: SetPythOracleReaderTokensInfoActionParamsSchema,
    signers: ['governor'],
  },
} satisfies InfinitActionRecord

export {
  DeployDoubleSlopeIRMsAction,
  DeployInitCapitalAction,
  DeployPythOracleReaderAction,
  SetIrmAction,
  SetMaxPriceDeviationAction,
  SetModeStatusAction,
  SetOracleAction,
  SetPoolConfigAction,
  DeployApi3ProxyOracleReaderAction,
  SetApi3ProxyOracleReaderTokensInfoAction,
}
