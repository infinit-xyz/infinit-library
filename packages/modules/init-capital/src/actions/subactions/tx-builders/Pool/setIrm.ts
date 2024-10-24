import { Address, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetIrmTxBuilderParams = {
  pool: Address
  irm: Address
}

export class SetIrmTxBuilder extends TxBuilder {
  pool: Address
  irm: Address

  constructor(client: InfinitWallet, params: SetIrmTxBuilderParams) {
    super(SetIrmTxBuilder.name, client)
    this.pool = params.pool
    this.irm = params.irm
  }

  async buildTx(): Promise<TransactionData> {
    const poolArtifact = await readArtifact('LendingPool')

    const callData = encodeFunctionData({
      abi: poolArtifact.abi,
      functionName: 'setIrm',
      args: [this.irm],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.pool,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pool === zeroAddress) {
      throw new ValidateInputZeroAddressError('pool')
    }
  }
}
