import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero, zodHex } from '@infinit-xyz/core/internal'

import { DeployPermit2Msg, DeployPermit2SubAction } from '@actions/subactions/deployPermit2'
import { DeployUniversalRouterSubAction } from '@actions/subactions/deployUniversalRouter'
import { DeployUnsupportedProtocolMsg, DeployUnsupportedProtocolSubAction } from '@actions/subactions/deployUnsupportedProtocol'

import { UniswapV3Registry } from '@/src/type'

export const DeployUniversalRouterParamsSchema = z.object({
  wrappedNativeToken: zodAddressNonZero.describe(`Address of the wrapped native token (e.g., WETH)`),
  seaportV1_5: zodAddressNonZero.optional().describe(`Address of the seaportV1_5 (optional)`),
  seaportV1_4: zodAddressNonZero.optional().describe(`Address of the seaportV1_4 (optional)`),
  openseaConduit: zodAddressNonZero.optional().describe(`Address of the openseaConduit (optional)`),
  nftxZap: zodAddressNonZero.optional().describe(`Address of the nftxZap (optional)`),
  x2y2: zodAddressNonZero.optional().describe(`Address of the x2y2 (optional)`),
  foundation: zodAddressNonZero.optional().describe(`Address of the foundation (optional)`),
  sudoswap: zodAddressNonZero.optional().describe(`Address of the sudoswap (optional)`),
  elementMarket: zodAddressNonZero.optional().describe(`Address of the elementMarket (optional)`),
  nft20Zap: zodAddressNonZero.optional().describe(`Address of the nft20Zap (optional)`),
  cryptopunks: zodAddressNonZero.optional().describe(`Address of the cryptopunks (optional)`),
  looksRareV2: zodAddressNonZero.optional().describe(`Address of the looksRareV2 (optional)`),
  routerRewardsDistributor: zodAddressNonZero.optional().describe(`Address of the routerRewardsDistributor (optional)`),
  looksRareRewardsDistributor: zodAddressNonZero.optional().describe(`Address of the looksRareRewardsDistributor (optional)`),
  looksRareToken: zodAddressNonZero.optional().describe(`Address of the looksRareToken (optional)`),
  v2Factory: zodAddressNonZero.optional().describe(`Address of the v2Factory (optional)`),
  v3Factory: zodAddressNonZero.optional().describe(`Address of the v3Factory (optional)`),
  pairInitCodeHash: zodHex.describe(`Hash of creation bytecode for Uniswap V2 pair`),
  poolInitCodeHash: zodHex.describe(`Hash of creation bytecode for Uniswap V3 pool`),
})

export type DeployUniversalRouterParams = z.infer<typeof DeployUniversalRouterParamsSchema>

export type DeployUniversalRouterActionData = {
  params: DeployUniversalRouterParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployUniversalRouterAction extends Action<DeployUniversalRouterActionData, UniswapV3Registry> {
  constructor(data: DeployUniversalRouterActionData) {
    validateActionData(data, DeployUniversalRouterParamsSchema, ['deployer'])
    super(DeployUniversalRouterAction.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer: InfinitWallet = this.data.signer['deployer']
    const params = this.data.params

    return [
      // step 1
      () => new DeployPermit2SubAction(deployer, {}),
      // step 2
      () => new DeployUnsupportedProtocolSubAction(deployer, {}),
      // step 3
      (message: DeployPermit2Msg & DeployUnsupportedProtocolMsg) =>
        new DeployUniversalRouterSubAction(deployer, {
          unsupportedProtocol: message.unsupportedProtocol,
          permit2: message.permit2,
          weth9: params.wrappedNativeToken,
          seaportV1_5: params.seaportV1_5,
          seaportV1_4: params.seaportV1_4,
          openseaConduit: params.openseaConduit,
          nftxZap: params.nftxZap,
          x2y2: params.x2y2,
          foundation: params.foundation,
          sudoswap: params.sudoswap,
          elementMarket: params.elementMarket,
          nft20Zap: params.nft20Zap,
          cryptopunks: params.cryptopunks,
          looksRareV2: params.looksRareV2,
          routerRewardsDistributor: params.routerRewardsDistributor,
          looksRareRewardsDistributor: params.looksRareRewardsDistributor,
          looksRareToken: params.looksRareToken,
          v2Factory: params.v2Factory,
          v3Factory: params.v3Factory,
          pairInitCodeHash: params.pairInitCodeHash,
          poolInitCodeHash: params.poolInitCodeHash,
        }),
    ]
  }
}
