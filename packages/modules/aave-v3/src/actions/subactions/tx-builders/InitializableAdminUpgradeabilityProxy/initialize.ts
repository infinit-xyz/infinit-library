import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializableAdminUpgradeabilityProxyParams = {
  targetContract: Address
  implementation: Address
  admin: Address
  data: Hex
}

export class InitializableAdminUpgradeabilityProxyTxBuilder extends TxBuilder {
  private targetContract: Address
  private implementation: Address
  private admin: Address
  private data: Hex

  constructor(client: InfinitWallet, params: InitializableAdminUpgradeabilityProxyParams) {
    super(InitializableAdminUpgradeabilityProxyTxBuilder.name, client)
    this.targetContract = getAddress(params.targetContract)
    this.implementation = getAddress(params.implementation)
    this.admin = getAddress(params.admin)
    this.data = params.data
  }

  async buildTx(): Promise<TransactionData> {
    const initializableAdminUpgradeabilityProxy = await readArtifact('InitializableAdminUpgradeabilityProxy')

    const callData = encodeFunctionData({
      abi: initializableAdminUpgradeabilityProxy.abi,
      functionName: 'initialize',
      args: [this.implementation, this.admin, this.data],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.targetContract,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.implementation === zeroAddress) {
      throw new ValidateInputZeroAddressError(`IMPLEMENTATION`)
    }
    if (this.admin === zeroAddress) {
      throw new ValidateInputZeroAddressError(`ADMIN`)
    }
  }
}
