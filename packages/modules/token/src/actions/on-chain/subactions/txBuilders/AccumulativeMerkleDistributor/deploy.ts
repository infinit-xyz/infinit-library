import { Address, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAccumulativeMerkleDistributorTxBuilderParams = {
  token: Address
}

export class DeployAccumulativeMerkleDistributorTxBuilder extends TxBuilder {
  private token: Address

  constructor(client: InfinitWallet, params: DeployAccumulativeMerkleDistributorTxBuilderParams) {
    super(DeployAccumulativeMerkleDistributorTxBuilder.name, client)

    this.token = getAddress(params.token)
  }

  async buildTx(): Promise<TransactionData> {
    const accMerkleDistributor = await readArtifact('AccumulativeMerkleDistributor')

    const encodedData = encodeDeployData({
      abi: accMerkleDistributor.abi,
      bytecode: accMerkleDistributor.bytecode,
      args: [this.token],
    })

    return {
      to: null,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {}
}
