import { ActionDetailRecord } from '@infinit-xyz/core'

import { AddNewModesAction, AddNewModesActionParamsSchema } from '@actions/addNewModes'
import { ChangeIrmAction, ChangeIrmActionParamsSchema } from '@actions/changeIrm'
import { DeployApi3ProxyOracleReaderAction, DeployApi3ProxyOracleReaderActionParamsSchema } from '@actions/deployApi3ProxyOracleReader'
import { DeployDoubleSlopeIRMsAction, DeployDoubleSlopeIRMsActionParamsSchema } from '@actions/deployDoubleSlopeIRMs'
import { DeployInitCapitalAction, DeployInitCapitalActionParamsSchema } from '@actions/deployInitCapital'
import { DeployPythOracleReaderAction, DeployPythOracleReaderActionParamsSchema } from '@actions/deployPythOracleReader'
import {
  SetApi3ProxyOracleReaderTokensInfoAction,
  SetApi3ProxyOracleReaderTokensInfoActionParamsSchema,
} from '@actions/setApi3ProxyOracleReaderTokensInfo'
import { SetIrmAction, SetIrmActionParamsSchema } from '@actions/setIrm'
import { SetMaxPriceDeviationAction, SetMaxPriceDeviationActionParamsSchema } from '@actions/setMaxPriceDeviation'
import { SetModeFactorsAction, SetModeFactorsActionParamsSchema } from '@actions/setModeFactors'
import { SetModeStatusAction, SetModeStatusActionParamsSchema } from '@actions/setModeStatus'
import { SetOracleAction, SetOracleActionParamsSchema } from '@actions/setOracle'
import { SetPoolConfigAction, SetPoolConfigParamsSchema } from '@actions/setPoolConfig'
import {
  SetPythOracleReaderTokensInfoAction,
  SetPythOracleReaderTokensInfoActionParamsSchema,
} from '@actions/setPythOracleReaderTokensInfo'
import { SupportNewPoolsAction, SupportNewPoolsActionParamsSchema } from '@actions/supportNewPools'

export const actions = {
  init: {
    type: 'on-chain',
    name: 'Deploy INIT Capital',
    actionClassName: DeployInitCapitalAction.name,
    paramsSchema: DeployInitCapitalActionParamsSchema,
    signers: ['deployer', 'accessControlManagerOwner'],
  },
  deployDoubleSlopeIRMs: {
    type: 'on-chain',
    name: 'Deploy Double Slope IRMs',
    actionClassName: DeployDoubleSlopeIRMsAction.name,
    paramsSchema: DeployDoubleSlopeIRMsActionParamsSchema,
    signers: ['deployer'],
  },
  setIrm: {
    type: 'on-chain',
    name: 'Set IRM',
    actionClassName: SetIrmAction.name,
    paramsSchema: SetIrmActionParamsSchema,
    signers: ['guardian'],
  },
  setModeStatus: {
    type: 'on-chain',
    name: 'Set Mode Status',
    actionClassName: SetModeStatusAction.name,
    paramsSchema: SetModeStatusActionParamsSchema,
    signers: ['guardian'],
  },
  setPoolConfig: {
    type: 'on-chain',
    name: 'Set Pool Config',
    actionClassName: SetPoolConfigAction.name,
    paramsSchema: SetPoolConfigParamsSchema,
    signers: ['guardian'],
  },
  setOracle: {
    type: 'on-chain',
    name: 'Set Oracle',
    actionClassName: SetOracleAction.name,
    paramsSchema: SetOracleActionParamsSchema,
    signers: ['governor'],
  },
  setMaxPriceDeviations: {
    type: 'on-chain',
    name: 'Set Max Price Deviation',
    actionClassName: SetMaxPriceDeviationAction.name,
    paramsSchema: SetMaxPriceDeviationActionParamsSchema,
    signers: ['governor'],
  },
  SetModeFactorsAction: {
    type: 'on-chain',
    name: 'Set Mode Factors Action',
    actionClassName: SetModeFactorsAction.name,
    paramsSchema: SetModeFactorsActionParamsSchema,
    signers: ['governor'],
  },
  deployApi3ProxyOracleReader: {
    type: 'on-chain',
    name: 'Deploy Api3 Proxy Oracle Reader',
    actionClassName: DeployApi3ProxyOracleReaderAction.name,
    paramsSchema: DeployApi3ProxyOracleReaderActionParamsSchema,
    signers: ['deployer'],
  },
  setApi3ProxyOracleReaderTokensInfo: {
    type: 'on-chain',
    name: 'Set Api3 Proxy Oracle Reader Tokens Info Action',
    actionClassName: SetApi3ProxyOracleReaderTokensInfoAction.name,
    paramsSchema: SetApi3ProxyOracleReaderTokensInfoActionParamsSchema,
    signers: ['governor'],
  },
  deployPythOracleReader: {
    type: 'on-chain',
    name: 'Deploy Pyth Oracle Reader',
    actionClassName: DeployPythOracleReaderAction.name,
    paramsSchema: DeployPythOracleReaderActionParamsSchema,
    signers: ['deployer'],
  },
  setPythOracleReaderTokensInfo: {
    type: 'on-chain',
    name: 'Set Pyth Oracle Reader Tokens Info',
    actionClassName: SetPythOracleReaderTokensInfoAction.name,
    paramsSchema: SetPythOracleReaderTokensInfoActionParamsSchema,
    signers: ['governor'],
  },
  supportNewPools: {
    type: 'on-chain',
    name: 'Support New Pools',
    actionClassName: SupportNewPoolsAction.name,
    paramsSchema: SupportNewPoolsActionParamsSchema,
    signers: ['deployer', 'guardian', 'governor'],
  },
  changeIrm: {
    type: 'on-chain',
    name: 'Change IRM',
    actionClassName: ChangeIrmAction.name,
    paramsSchema: ChangeIrmActionParamsSchema,
    signers: ['deployer', 'guardian'],
  },
  addNewModes: {
    type: 'on-chain',
    name: 'Add New Modes',
    actionClassName: AddNewModesAction.name,
    paramsSchema: AddNewModesActionParamsSchema,
    signers: ['guardian', 'governor'],
  },
} satisfies ActionDetailRecord

export {
  ChangeIrmAction,
  DeployApi3ProxyOracleReaderAction,
  DeployDoubleSlopeIRMsAction,
  DeployInitCapitalAction,
  DeployPythOracleReaderAction,
  SetApi3ProxyOracleReaderTokensInfoAction,
  SetIrmAction,
  SetMaxPriceDeviationAction,
  SetModeFactorsAction,
  SetModeStatusAction,
  SetOracleAction,
  SetPoolConfigAction,
  SetPythOracleReaderTokensInfoAction,
  SupportNewPoolsAction,
  AddNewModesAction,
}
