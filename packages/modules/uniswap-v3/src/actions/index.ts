import { InfinitActionRecord } from '@infinit-xyz/core'

import { DeployUniswapV3Action, DeployUniswapV3ParamSchema } from '@actions/deployUniswapV3'
import { EnableFeeAmountsAction, EnableFeeAmountsActionParamsSchema } from '@actions/enableFeeAmounts'
import { SetFactoryOwnerAction, SetFactoryOwnerActionParamsSchema } from '@actions/setFactoryOwner'
import { SetFeeProtocolAction } from '@actions/setFeeProtocol'
import { TransferProxyAdminOwnerAction, TransferProxyAdminOwnerActionParamsSchema } from '@actions/transferProxyAdminOwner'

import { CollectProtocolAction, CollectProtocolActionParamsSchema } from './collectProtocol'
import { DeployUniswapV3StakerAction, DeployUniswapV3StakerParamSchema } from './deployUniswapV3Staker'
import { DeployUniversalRouterAction, DeployUniversalRouterParamSchema } from './deployUniversalRouter'

// example of actions
export const actions = {
  init: {
    name: 'Deploy UniswapV3',
    actionClassName: DeployUniswapV3Action.name,
    paramSchema: DeployUniswapV3ParamSchema,
    signers: ['deployer'],
  },
  setFactoryOwnerAction: {
    name: 'Set Factory Owner',
    actionClassName: SetFactoryOwnerAction.name,
    paramSchema: SetFactoryOwnerActionParamsSchema,
    signers: ['factoryOwner'],
  },
  transferProxyAdminOwnerAction: {
    name: 'Transfer Proxy Admin Owner',
    actionClassName: TransferProxyAdminOwnerAction.name,
    paramSchema: TransferProxyAdminOwnerActionParamsSchema,
    signers: ['proxyAdminOwner'],
  },
  enableFeeAmountsAction: {
    name: 'Enable Fee Amounts',
    actionClassName: EnableFeeAmountsAction.name,
    paramSchema: EnableFeeAmountsActionParamsSchema,
    signers: ['factoryOwner'],
  },
  setFeeProtocolAction: {
    name: 'Set Fee Protocol',
    actionClassName: SetFeeProtocolAction.name,
    paramSchema: SetFactoryOwnerActionParamsSchema,
    signers: ['factoryOwner'],
  },
  collectFeeProtocolAction: {
    name: 'Collect Fee Protocol',
    actionClassName: CollectProtocolAction.name,
    paramSchema: CollectProtocolActionParamsSchema,
    signers: ['factoryOwner'],
  },
  deployUniversalRouterAction: {
    name: 'Deploy Universal Router',
    actionClassName: DeployUniversalRouterAction.name,
    paramSchema: DeployUniversalRouterParamSchema,
    signers: ['deployer'],
  },
  deployUniswapV3StakerAction: {
    name: 'Deploy Uniswap V3 Staker',
    actionClassName: DeployUniswapV3StakerAction.name,
    paramSchema: DeployUniswapV3StakerParamSchema,
    signers: ['deployer']
  }
} satisfies InfinitActionRecord

export {
  CollectProtocolAction,
  DeployUniswapV3Action,
  DeployUniversalRouterAction,
  EnableFeeAmountsAction,
  SetFactoryOwnerAction,
  SetFeeProtocolAction,
  TransferProxyAdminOwnerAction,
  DeployUniswapV3StakerAction
}

