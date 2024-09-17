import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeAccumulativeMerkleDistributorTxBuilderParams = {
  accumulativeMerkleDistributor: Address
  token: Address
}

export class InitializeAccumulativeMerkleDistributorTxBuilder extends TxBuilder {
  private accumulativeMerkleDistributor: Address

  constructor(client: InfinitWallet, params: InitializeAccumulativeMerkleDistributorTxBuilderParams) {
    super(InitializeAccumulativeMerkleDistributorTxBuilder.name, client)

    this.accumulativeMerkleDistributor = getAddress(params.accumulativeMerkleDistributor)
  }

  async buildTx(): Promise<TransactionData> {
    const accMerkleDistributor = await readArtifact('AccumulativeMerkleDistributor')

    const encodedData = encodeFunctionData({
      abi: accMerkleDistributor.abi,
      functionName: 'initialize',
      args: [],
    })

    return {
      to: this.accumulativeMerkleDistributor,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.accumulativeMerkleDistributor === zeroAddress)
      throw new ValidateInputValueError('accumulativeMerkleDistributor cannot be zero address')
  }
}
