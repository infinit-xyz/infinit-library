import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployUniswapV3Action, DeployUniswapV3ParamsSchema } from '@actions/deployUniswapV3'
import { EnableFeeAmountsAction, EnableFeeAmountsActionParamsSchema } from '@actions/enableFeeAmounts'
import { SetFactoryOwnerAction, SetFactoryOwnerActionParamsSchema } from '@actions/setFactoryOwner'
import { SetFeeProtocolAction } from '@actions/setFeeProtocol'
import { TransferProxyAdminOwnerAction, TransferProxyAdminOwnerActionParamsSchema } from '@actions/transferProxyAdminOwner'

import { CollectProtocolAction, CollectProtocolActionParamsSchema } from './collectProtocol'
import { CreateIncentivesAction, CreateIncentivesActionParamsSchema } from './createIncentives'
import { DeployUniswapV3StakerAction, DeployUniswapV3StakerParamsSchema } from './deployUniswapV3Staker'
import { DeployUniversalRouterAction, DeployUniversalRouterParamsSchema } from './deployUniversalRouter'

// example of actions
export const actions = {
  init: {
    name: 'Deploy UniswapV3',
    actionClassName: DeployUniswapV3Action.name,
    paramsSchema: DeployUniswapV3ParamsSchema,
    signers: ['deployer'],
  },
  setFactoryOwnerAction: {
    name: 'Set Factory Owner',
    actionClassName: SetFactoryOwnerAction.name,
    paramsSchema: SetFactoryOwnerActionParamsSchema,
    signers: ['factoryOwner'],
  },
  transferProxyAdminOwnerAction: {
    name: 'Transfer Proxy Admin Owner',
    actionClassName: TransferProxyAdminOwnerAction.name,
    paramsSchema: TransferProxyAdminOwnerActionParamsSchema,
    signers: ['proxyAdminOwner'],
  },
  enableFeeAmountsAction: {
    name: 'Enable Fee Amounts',
    actionClassName: EnableFeeAmountsAction.name,
    paramsSchema: EnableFeeAmountsActionParamsSchema,
    signers: ['factoryOwner'],
  },
  setFeeProtocolAction: {
    name: 'Set Fee Protocol',
    actionClassName: SetFeeProtocolAction.name,
    paramsSchema: SetFactoryOwnerActionParamsSchema,
    signers: ['factoryOwner'],
  },
  collectFeeProtocolAction: {
    name: 'Collect Fee Protocol',
    actionClassName: CollectProtocolAction.name,
    paramsSchema: CollectProtocolActionParamsSchema,
    signers: ['factoryOwner'],
  },
  deployUniversalRouterAction: {
    name: 'Deploy Universal Router',
    actionClassName: DeployUniversalRouterAction.name,
    paramsSchema: DeployUniversalRouterParamsSchema,
    signers: ['deployer'],
  },
  deployUniswapV3StakerAction: {
    name: 'Deploy Uniswap V3 Staker',
    actionClassName: DeployUniswapV3StakerAction.name,
    paramsSchema: DeployUniswapV3StakerParamsSchema,
    signers: ['deployer'],
  },
  createIncentivesAction: {
    name: 'Create Incentives',
    actionClassName: CreateIncentivesAction.name,
    paramsSchema: CreateIncentivesActionParamsSchema,
    signers: ['incentiveCreator'],
  },
} satisfies InfinitActionRecord

export {
  CollectProtocolAction,
  CreateIncentivesAction,
  DeployUniswapV3Action,
  DeployUniswapV3StakerAction,
  DeployUniversalRouterAction,
  EnableFeeAmountsAction,
  SetFactoryOwnerAction,
  SetFeeProtocolAction,
  TransferProxyAdminOwnerAction,
}
