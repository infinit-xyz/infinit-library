import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetACLManagerParams = {
  poolAddressesProvider: Address
  aclManager: Address
}

export class SetACLManagerTxBuilder extends TxBuilder {
  private poolAddressesProvider: Address
  private aclManager: Address

  constructor(client: InfinitWallet, params: SetACLManagerParams) {
    super(SetACLManagerTxBuilder.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.aclManager = getAddress(params.aclManager)
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({ abi: providerArtifact.abi, functionName: 'setACLManager', args: [this.aclManager] })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // aclManager can be zeroAddress
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('pool address provider cannot be zero address')
  }
}
