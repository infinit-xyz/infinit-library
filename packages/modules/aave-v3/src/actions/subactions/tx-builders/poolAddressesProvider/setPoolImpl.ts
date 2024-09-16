import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolImplParams = {
  poolAddressProvider: Address
  poolImpl: Address
}

export class SetPoolImplTxBuilder extends TxBuilder {
  private poolAddressProvider: Address
  private poolImpl: Address

  constructor(client: InfinitWallet, params: SetPoolImplParams) {
    super(SetPoolImplTxBuilder.name, client)
    this.poolAddressProvider = params.poolAddressProvider
    this.poolImpl = params.poolImpl
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({ abi: providerArtifact.abi, functionName: 'setPoolImpl', args: [this.poolImpl] })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
