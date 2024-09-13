import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployUniversalRouterTxBuilderParams = {
  unsupportedProtocol: Address
  permit2: Address
  weth9: Address
  seaportV1_5?: Address
  seaportV1_4?: Address
  openseaConduit?: Address
  nftxZap?: Address
  x2y2?: Address
  foundation?: Address
  sudoswap?: Address
  elementMarket?: Address
  nft20Zap?: Address
  cryptopunks?: Address
  looksRareV2?: Address
  routerRewardsDistributor?: Address
  looksRareRewardsDistributor?: Address
  looksRareToken?: Address
  v2Factory?: Address
  v3Factory?: Address
  pairInitCodeHash: Hex
  poolInitCodeHash: Hex
}

export class DeployUniversalRouterTxBuilder extends TxBuilder {
  private unsupportedProtocol: Address
  private permit2: Address
  private weth9: Address
  private seaportV1_5: Address
  private seaportV1_4: Address
  private openseaConduit: Address
  private nftxZap: Address
  private x2y2: Address
  private foundation: Address
  private sudoswap: Address
  private elementMarket: Address
  private nft20Zap: Address
  private cryptopunks: Address
  private looksRareV2: Address
  private routerRewardsDistributor: Address
  private looksRareRewardsDistributor: Address
  private looksRareToken: Address
  private v2Factory: Address
  private v3Factory: Address
  private pairInitCodeHash: Hex
  private poolInitCodeHash: Hex

  constructor(client: InfinitWallet, params: DeployUniversalRouterTxBuilderParams) {
    super(DeployUniversalRouterTxBuilder.name, client)
    this.unsupportedProtocol = getAddress(params.unsupportedProtocol)
    this.permit2 = getAddress(params.permit2)
    this.weth9 = getAddress(params.weth9)
    this.pairInitCodeHash = params.pairInitCodeHash
    this.poolInitCodeHash = params.poolInitCodeHash
    // for optional params, if not provided, set to unsupportedProtocol
    this.seaportV1_5 = params.seaportV1_5 ?? this.unsupportedProtocol
    this.seaportV1_4 = params.seaportV1_4 ?? this.unsupportedProtocol
    this.openseaConduit = params.openseaConduit ?? this.unsupportedProtocol
    this.nftxZap = params.nftxZap ?? this.unsupportedProtocol
    this.x2y2 = params.x2y2 ?? this.unsupportedProtocol
    this.foundation = params.foundation ?? this.unsupportedProtocol
    this.sudoswap = params.sudoswap ?? this.unsupportedProtocol
    this.elementMarket = params.elementMarket ?? this.unsupportedProtocol
    this.nft20Zap = params.nft20Zap ?? this.unsupportedProtocol
    this.cryptopunks = params.cryptopunks ?? this.unsupportedProtocol
    this.looksRareV2 = params.looksRareV2 ?? this.unsupportedProtocol
    this.routerRewardsDistributor = params.routerRewardsDistributor ?? this.unsupportedProtocol
    this.looksRareRewardsDistributor = params.looksRareRewardsDistributor ?? this.unsupportedProtocol
    this.looksRareToken = params.looksRareToken ?? this.unsupportedProtocol
    this.v2Factory = params.v2Factory ?? this.unsupportedProtocol
    this.v3Factory = params.v3Factory ?? this.unsupportedProtocol
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3StakerArtifact = await readArtifact('UniversalRouter')

    const deployData: Hex = encodeDeployData({
      abi: uniswapV3StakerArtifact.abi,
      bytecode: uniswapV3StakerArtifact.bytecode as Hex,
      args: [
        {
          permit2: this.permit2,
          weth9: this.weth9,
          seaportV1_5: this.seaportV1_5,
          seaportV1_4: this.seaportV1_4,
          openseaConduit: this.openseaConduit,
          nftxZap: this.nftxZap,
          x2y2: this.x2y2,
          foundation: this.foundation,
          sudoswap: this.sudoswap,
          elementMarket: this.elementMarket,
          nft20Zap: this.nft20Zap,
          cryptopunks: this.cryptopunks,
          looksRareV2: this.looksRareV2,
          routerRewardsDistributor: this.routerRewardsDistributor,
          looksRareRewardsDistributor: this.looksRareRewardsDistributor,
          looksRareToken: this.looksRareToken,
          v2Factory: this.v2Factory,
          v3Factory: this.v3Factory,
          pairInitCodeHash: this.pairInitCodeHash,
          poolInitCodeHash: this.poolInitCodeHash,
        },
      ],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  async validate(): Promise<void> {
    // validate all addresses is not zero address
    if (this.permit2 === zeroAddress) throw new ValidateInputValueError('permit2 cannot be zero address')
    if (this.weth9 === zeroAddress) throw new ValidateInputValueError('weth9 cannot be zero address')
    if (this.unsupportedProtocol === zeroAddress) throw new ValidateInputValueError('unsupportedProtocol cannot be zero address')
  }
}
