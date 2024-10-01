import { Address, PublicClient, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolDataProviderParams = {
  poolAddressesProvider: Address
  aaveProtocolDataProvider: Address
}

export class SetPoolDataProvider extends TxBuilder {
  private poolAddressesProvider: Address
  private aaveProtocolDataProvider: Address

  constructor(client: InfinitWallet, params: SetPoolDataProviderParams) {
    super(SetPoolDataProvider.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.aaveProtocolDataProvider = getAddress(params.aaveProtocolDataProvider)
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')

    const functionData = encodeFunctionData({
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'setPoolDataProvider',
      args: [this.aaveProtocolDataProvider],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputZeroAddressError('POOL_ADDRESSES_PROVIDER')
    if (this.aaveProtocolDataProvider === zeroAddress) throw new ValidateInputZeroAddressError('AAVE_PROTOCOL_DATA_PROVIDER')
    const poolDataProvider = await this.getPoolDataProvider(this.client)
    if (this.aaveProtocolDataProvider === poolDataProvider) throw new ValidateInputValueError('NEW_AAVE_PROTOCOL_DATA_PROVIDER_ALREADY_SET')
  }

  private async getPoolDataProvider(client: InfinitWallet): Promise<Address> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')
    const publicClient: PublicClient = client.publicClient as PublicClient
    const poolDataProviderAddress: Address = await publicClient.readContract({
      address: this.poolAddressesProvider,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'getPoolDataProvider',
      args: [],
    })
    return poolDataProviderAddress
  }
}
