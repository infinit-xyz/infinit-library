import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeConfigTxBuilderParams = {
  config: Address
}

export class InitializeConfigTxBuilder extends TxBuilder {
  private config: Address

  constructor(client: InfinitWallet, params: InitializeConfigTxBuilderParams) {
    super(InitializeConfigTxBuilder.name, client)
    this.config = getAddress(params.config)
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')
    const functionData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.config,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG')
  }
}
