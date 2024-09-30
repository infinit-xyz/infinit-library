import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolConfiguratorImplParams = {
  poolAddressesProvider: Address
  poolConfiguratorImpl: Address
}

export class SetPoolConfiguratorImplTxBuilder extends TxBuilder {
  private poolAddressesProvider: Address
  private poolConfiguratorImpl: Address

  constructor(client: InfinitWallet, params: SetPoolConfiguratorImplParams) {
    super(SetPoolConfiguratorImplTxBuilder.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.poolConfiguratorImpl = getAddress(params.poolConfiguratorImpl)
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
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('pool address provider cannot be zero address')
  }
}
