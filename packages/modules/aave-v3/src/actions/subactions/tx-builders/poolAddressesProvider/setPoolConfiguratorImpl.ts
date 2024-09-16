import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolConfiguratorImplParams = {
  poolAddressProvider: Address
  poolConfiguratorImpl: Address
}

export class SetPoolConfiguratorImplTxBuilder extends TxBuilder {
  private poolAddressProvider: Address
  private poolConfiguratorImpl: Address

  constructor(client: InfinitWallet, params: SetPoolConfiguratorImplParams) {
    super(SetPoolConfiguratorImplTxBuilder.name, client)
    this.poolAddressProvider = params.poolAddressProvider
    this.poolConfiguratorImpl = params.poolConfiguratorImpl
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({
      abi: providerArtifact.abi,
      functionName: 'setPoolConfiguratorImpl',
      args: [this.poolConfiguratorImpl],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
