import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type MintTxBuilderParams = {
  token: Address
  receiver: Address
  amount: bigint
}

export class MintTxBuilder extends TxBuilder {
  private token: Address
  private receiver: Address
  private amount: bigint

  constructor(client: InfinitWallet, params: MintTxBuilderParams) {
    super(MintTxBuilder.name, client)

    this.token = getAddress(params.token)
    this.receiver = getAddress(params.receiver)
    this.amount = params.amount
  }

  async buildTx(): Promise<TransactionData> {
    const infinitERC20 = await readArtifact('InfinitERC20')

    const functionData = encodeFunctionData({
      abi: infinitERC20.abi,
      functionName: 'mint',
      args: [this.receiver, this.amount],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.token,
    }

    return tx
  }

  public async validate(): Promise<void> {
    const infinitERC20Artifact = await readArtifact('InfinitERC20')
    const owner: Address = await this.client.publicClient.readContract({
      address: this.token,
      abi: infinitERC20Artifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) {
      throw new ContractValidateError('caller is not the owner')
    }
  }
}
