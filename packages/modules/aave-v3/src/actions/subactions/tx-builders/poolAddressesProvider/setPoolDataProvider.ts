import { Address, PublicClient, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

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
    this.poolAddressesProvider = params.poolAddressesProvider
    this.aaveProtocolDataProvider = params.aaveProtocolDataProvider
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
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('PoolAddressesProvider should not be zero')
    if (this.aaveProtocolDataProvider === zeroAddress) throw new ValidateInputValueError('PoolAddressesProviderRegistry should not be zero')
    const poolDataProvider = await this.getPoolDataProvider(this.client)
    if (this.aaveProtocolDataProvider === poolDataProvider)
      throw new ValidateInputValueError('new AaveProtocolDataProvider address already set')
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
