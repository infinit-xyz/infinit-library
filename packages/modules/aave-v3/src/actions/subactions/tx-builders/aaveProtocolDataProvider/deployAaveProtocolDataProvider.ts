import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAaveProtocolDataProviderParams = {
  poolAddressesProvider: Address
}

export class DeployAaveProtocolDataProvider extends TxBuilder {
  private poolAddressesProvider: Address

  constructor(client: InfinitWallet, params: DeployAaveProtocolDataProviderParams) {
    super(DeployAaveProtocolDataProvider.name, client)
    this.poolAddressesProvider = params.poolAddressesProvider
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderRegistryArtifact = await readArtifact('AaveProtocolDataProvider')

    const deployData = encodeDeployData({
      abi: poolAddressesProviderRegistryArtifact.abi,
      bytecode: poolAddressesProviderRegistryArtifact.bytecode as Hex,
      args: [this.poolAddressesProvider],
    })
    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('PoolAddressesProvider should not be zero')
  }
}
