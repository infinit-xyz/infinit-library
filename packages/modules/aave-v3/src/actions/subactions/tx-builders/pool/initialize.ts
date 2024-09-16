import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePoolParams = {
  pool: Address
  poolAddressesProvider: Address
}

export class InitializePool extends TxBuilder {
  private pool: Address
  private poolAddressesProvider: Address

  constructor(client: InfinitWallet, params: InitializePoolParams) {
    super(InitializePool.name, client)
    this.pool = getAddress(params.pool)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
  }

  async buildTx(): Promise<TransactionData> {
    const poolArtifact = await readArtifact('Pool')

    const functionData = encodeFunctionData({
      abi: poolArtifact.abi,
      functionName: 'initialize',
      args: [this.poolAddressesProvider],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pool,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const poolArtifact = await readArtifact('Pool')
    const addressesProviderInContract: Address = await this.client.publicClient.readContract({
      address: this.pool,
      abi: poolArtifact.abi,
      functionName: 'ADDRESSES_PROVIDER',
      args: [],
    })

    if (this.poolAddressesProvider !== addressesProviderInContract) {
      throw new ValidateInputValueError('invalid poolAddressesProvider')
    }
  }
}
