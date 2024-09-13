import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployUniswapV3StakerTxBuilderParams = {
  factory: Address
  nonfungiblePositionManager: Address
  maxIncentiveStartLeadTime: bigint
  maxIncentiveDuration: bigint
}

export class DeployUniswapV3StakerTxBuilder extends TxBuilder {
  private factory: Address
  private nonfungiblePositionManager: Address
  private maxIncentiveStartLeadTime: bigint
  private maxIncentiveDuration: bigint

  constructor(client: InfinitWallet, params: DeployUniswapV3StakerTxBuilderParams) {
    super(DeployUniswapV3StakerTxBuilder.name, client)
    this.factory = getAddress(params.factory)
    this.nonfungiblePositionManager = getAddress(params.nonfungiblePositionManager)
    this.maxIncentiveStartLeadTime = params.maxIncentiveStartLeadTime
    this.maxIncentiveDuration = params.maxIncentiveDuration
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3StakerArtifact = await readArtifact('UniswapV3Staker')

    const deployData: Hex = encodeDeployData({
      abi: uniswapV3StakerArtifact.abi,
      bytecode: uniswapV3StakerArtifact.bytecode as Hex,
      args: [this.factory, this.nonfungiblePositionManager, this.maxIncentiveStartLeadTime, this.maxIncentiveDuration],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  async validate(): Promise<void> {}
}
