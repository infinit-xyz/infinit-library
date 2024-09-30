import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetReserveStableRateBorrowingParams = {
  poolConfigurator: Address
  token: Address
  enabled: boolean
}

export class SetReserveStableRateBorrowingTxBuilder extends TxBuilder {
  private poolConfigurator: Address
  private token: Address
  private enabled: boolean

  constructor(client: InfinitWallet, params: SetReserveStableRateBorrowingParams) {
    super(SetReserveStableRateBorrowingTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.token = getAddress(params.token)
    this.enabled = params.enabled
  }

  async buildTx(): Promise<TransactionData> {
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const callData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'setReserveStableRateBorrowing',
      args: [this.token, this.enabled],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.poolConfigurator,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.token === zeroAddress) {
      throw new ValidateInputValueError('token cannot be zero address')
    }
  }
}
