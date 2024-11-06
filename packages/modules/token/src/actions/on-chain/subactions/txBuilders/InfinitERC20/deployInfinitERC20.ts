import { Address, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployInfinitERC20TxBuilderParams = {
  owner: Address
  name: string
  symbol: string
  maxSupply: bigint
  initialSupply: bigint
}

export class DeployInfinitERC20TxBuilder extends TxBuilder {
  owner: Address
  tokenName: string
  tokenSymbol: string
  tokenMaxSupply: bigint
  tokenInitialSupply: bigint

  constructor(client: InfinitWallet, params: DeployInfinitERC20TxBuilderParams) {
    super(DeployInfinitERC20TxBuilder.name, client)

    this.owner = getAddress(params.owner)
    this.tokenName = params.name
    this.tokenSymbol = params.symbol
    this.tokenMaxSupply = params.maxSupply
    this.tokenInitialSupply = params.initialSupply
  }

  async buildTx(): Promise<TransactionData> {
    const infinitERC20 = await readArtifact('InfinitERC20')

    const encodedData = encodeDeployData({
      abi: infinitERC20.abi,
      bytecode: infinitERC20.bytecode,
      args: [this.owner, this.tokenName, this.tokenSymbol, this.tokenMaxSupply, this.tokenInitialSupply],
    })

    return {
      to: null,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {}
}
