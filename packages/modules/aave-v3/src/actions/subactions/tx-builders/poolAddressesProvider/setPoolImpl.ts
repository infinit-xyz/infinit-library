import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolImplParams = {
  poolAddressesProvider: Address
  poolImpl: Address
}

export class SetPoolImplTxBuilder extends TxBuilder {
  private poolAddressesProvider: Address
  private poolImpl: Address

  constructor(client: InfinitWallet, params: SetPoolImplParams) {
    super(SetPoolImplTxBuilder.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.poolImpl = getAddress(params.poolImpl)
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({ abi: providerArtifact.abi, functionName: 'setPoolImpl', args: [this.poolImpl] })

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
