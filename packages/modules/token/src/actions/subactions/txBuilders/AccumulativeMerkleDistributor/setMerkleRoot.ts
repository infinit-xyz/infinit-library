import { Address, Hex, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetMerkleRootTxBuilderParams = {
  accumulativeMerkleDistributor: Address
  root: Hex
}

export class SetMerkleRootTxBuilder extends TxBuilder {
  accumulativeMerkleDistributor: Address
  root: Hex

  constructor(client: InfinitWallet, params: SetMerkleRootTxBuilderParams) {
    super(SetMerkleRootTxBuilder.name, client)
    this.accumulativeMerkleDistributor = params.accumulativeMerkleDistributor
    this.root = params.root
  }

  async buildTx(): Promise<TransactionData> {
    const accMerkleDistributor = await readArtifact('AccumulativeMerkleDistributor')

    const callData = encodeFunctionData({
      abi: accMerkleDistributor.abi,
      functionName: 'setMerkleRoot',

      args: [this.root],
    })

    return {
      to: this.accumulativeMerkleDistributor,
      data: callData,
    }
  }

  public async validate(): Promise<void> {
    const accMerkleDistributor = await readArtifact('AccumulativeMerkleDistributor')

    const owner = await this.client.publicClient.readContract({
      address: this.accumulativeMerkleDistributor,
      abi: accMerkleDistributor.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can set merkle root')
  }
}
