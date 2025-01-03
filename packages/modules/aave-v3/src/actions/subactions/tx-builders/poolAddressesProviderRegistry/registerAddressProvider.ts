import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type RegisterAddressProviderParams = {
  providerId: bigint
  poolAddressesProviderRegistry: Address
  poolAddressesProvider: Address
}

export class RegisterAddressProvider extends TxBuilder {
  /**
   * @remarks
   * call by only providerRegistryOwner
   */

  private providerId: bigint
  private poolAddressesProviderRegistry: Address
  private poolAddressesProvider: Address

  constructor(client: InfinitWallet, params: RegisterAddressProviderParams) {
    super(RegisterAddressProvider.name, client)
    this.providerId = params.providerId
    this.poolAddressesProviderRegistry = getAddress(params.poolAddressesProviderRegistry)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderRegistryArtifact = await readArtifact('PoolAddressesProviderRegistry')

    const functionData = encodeFunctionData({
      abi: poolAddressesProviderRegistryArtifact.abi,
      functionName: 'registerAddressesProvider',
      args: [this.poolAddressesProvider, this.providerId],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.poolAddressesProviderRegistry,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProviderRegistry === zeroAddress) {
      throw new ValidateInputZeroAddressError('POOL_ADDRESS_PROVIDER_REGISTRY')
    }

    if (this.poolAddressesProvider === zeroAddress) {
      throw new ValidateInputZeroAddressError('POOL_ADDRESS_PROVIDER')
    }
  }
}
