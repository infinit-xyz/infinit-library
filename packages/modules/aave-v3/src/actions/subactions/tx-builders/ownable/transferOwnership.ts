import { Address, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type TransferOwnershipParams = {
  ownableContract: Address
  newOwner: Address
}

export class TransferOwnershipTxBuilder extends TxBuilder {
  private ownableContract: Address

  private newOwner: Address

  constructor(client: InfinitWallet, params: TransferOwnershipParams) {
    super(TransferOwnershipTxBuilder.name, client)
    this.ownableContract = params.ownableContract
    this.newOwner = params.newOwner
  }

  async buildTx(): Promise<TransactionData> {
    const ownableArtifact = await readArtifact('Ownable')

    const functionData = encodeFunctionData({
      abi: ownableArtifact.abi,
      functionName: 'transferOwnership',
      args: [this.newOwner],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.ownableContract,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.newOwner === zeroAddress) throw new ValidateInputValueError('newOwner cannot be zero address')
  }
}
