import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  DeployNonfungibleTokenPositionDescriptorMsg,
  DeployNonfungibleTokenPositionDescriptorSubAction,
} from '@actions/subactions/deployNonfungibleTokenPositionDescriptor'
import { DeploySwapRouter02SubAction } from '@actions/subactions/deploySwapRouter02'
import { DeployUniswapV3Contracts1SubAction, DeployUniswapV3Msg } from '@actions/subactions/deployUniswapV3Contracts1'
import { DeployUniswapV3Contracts2SubAction, DeployUniswapV3Msg2 } from '@actions/subactions/deployUniswapV3Contracts2'

import {
  DeployNonfungiblePositionManagerMsg,
  DeployNonfungiblePositionManagerSubAction,
} from '@/src/actions/subactions/deployNonfungiblePositionManager'
import { SetFactoryOwnerSubAction } from '@/src/actions/subactions/setFactoryOwner'
import { TransferProxyAdminOwnerSubAction } from '@/src/actions/subactions/transferProxyAdminOwner'
import { UniswapV3Registry } from '@/src/type'

export const DeployUniswapV3ParamsSchema = z.object({
  nativeCurrencyLabel: z.string().describe(`Native currency label (e.g., ETH)`),
  proxyAdminOwner: zodAddress.describe(`Address of the owner of the proxy admin`),
  factoryOwner: zodAddress.describe(`Address of the owner of factory`),
  wrappedNativeToken: zodAddress.describe(`Address of the wrapped native token (e.g., WETH)`),
  uniswapV2Factory: zodAddress.optional().describe(`Address of the Uniswap V2 factory (default: zeroAddress)`),
})

export type DeployUniswapV3Params = z.infer<typeof DeployUniswapV3ParamsSchema>

export type DeployUniswapV3ActionData = {
  params: DeployUniswapV3Params
  signer: Record<'deployer', InfinitWallet>
}

export class DeployUniswapV3Action extends Action<DeployUniswapV3ActionData, UniswapV3Registry> {
  constructor(data: DeployUniswapV3ActionData) {
    validateActionData(data, DeployUniswapV3ParamsSchema, ['deployer'])
    super(DeployUniswapV3Action.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer: InfinitWallet = this.data.signer['deployer']
    const params = this.data.params

    return [
      // step 1
      () => new DeployUniswapV3Contracts1SubAction(deployer, {}),
      // step 2
      (message: DeployUniswapV3Msg) =>
        new DeployUniswapV3Contracts2SubAction(deployer, {
          uniswapV3Factory: message.uniswapV3Factory,
          weth9: params.wrappedNativeToken,
          nftDescriptor: message.nftDescriptor,
          nativeCurrencyLabel: params.nativeCurrencyLabel,
        }),
      // step 3
      (message: DeployUniswapV3Msg & DeployUniswapV3Msg2) =>
        new DeployNonfungibleTokenPositionDescriptorSubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          nonfungibleTokenPositionDescriptorImpl: message.nonfungibleTokenPositionDescriptorImpl,
        }),

      // step 4
      (message: DeployUniswapV3Msg & DeployUniswapV3Msg2 & DeployNonfungibleTokenPositionDescriptorMsg) =>
        new DeployNonfungiblePositionManagerSubAction(deployer, {
          uniswapV3Factory: message.uniswapV3Factory,
          weth9: params.wrappedNativeToken,
          nftDescriptor: message.nonfungibleTokenPositionDescriptor,
        }),

      // step 5
      (
        message: DeployUniswapV3Msg &
          DeployUniswapV3Msg2 &
          DeployNonfungibleTokenPositionDescriptorMsg &
          DeployNonfungiblePositionManagerMsg,
      ) =>
        new DeploySwapRouter02SubAction(deployer, {
          factoryV2: params.uniswapV2Factory,
          factoryV3: message.uniswapV3Factory,
          positionManager: message.nonfungiblePositionManager,
          weth9: params.wrappedNativeToken,
        }),

      // step 6
      (
        message: DeployUniswapV3Msg &
          DeployUniswapV3Msg2 &
          DeployNonfungibleTokenPositionDescriptorMsg &
          DeployNonfungiblePositionManagerMsg,
      ) =>
        new SetFactoryOwnerSubAction(deployer, {
          uniswapV3Factory: message.uniswapV3Factory,
          newOwner: params.factoryOwner,
        }),

      // step 7
      (
        message: DeployUniswapV3Msg &
          DeployUniswapV3Msg2 &
          DeployNonfungibleTokenPositionDescriptorMsg &
          DeployNonfungiblePositionManagerMsg,
      ) =>
        new TransferProxyAdminOwnerSubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          newOwner: params.proxyAdminOwner,
        }),
    ]
  }
}
