import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePoolConfiguratorParams = {
  poolConfig: Address
  poolAddressesProvider: Address
}

export class InitializePoolConfiguratorTxBuilder extends TxBuilder {
  private poolConfig: Address
  private poolAddressesProvider: Address

  constructor(client: InfinitWallet, params: InitializePoolConfiguratorParams) {
    super(InitializePoolConfiguratorTxBuilder.name, client)
    this.poolConfig = getAddress(params.poolConfig)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
  }

  async buildTx(): Promise<TransactionData> {
    const configuratorArtifact = await readArtifact('PoolConfigurator')
    const callData = encodeFunctionData({ abi: configuratorArtifact.abi, functionName: 'initialize', args: [this.poolAddressesProvider] })

    const tx: TransactionData = {
      data: callData,
      to: this.poolConfig,
    }
    return tx
  }

  public validate(): any {
    if (this.poolConfig === zeroAddress) throw new ValidateInputZeroAddressError('CONFIGURATOR_LOGIC')
  }
}
