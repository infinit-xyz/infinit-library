import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address, Hex, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPoolConfiguratorParams = {
  configuratorLogic: Address
}

export class DeployPoolConfiguratorTxBuilder extends TxBuilder {
  private configuratorLogic: Address

  constructor(client: InfinitWallet, params: DeployPoolConfiguratorParams) {
    super(DeployPoolConfiguratorTxBuilder.name, client)
    this.configuratorLogic = getAddress(params.configuratorLogic)
  }

  async buildTx(): Promise<TransactionData> {
    const configuratorArtifact = await readArtifact('PoolConfigurator')

    const libraries: Libraries<Address> = {
      ConfiguratorLogic: this.configuratorLogic,
    }
    const bytecode: Hex = await resolveBytecodeWithLinkedLibraries(configuratorArtifact, libraries)

    const tx: TransactionData = {
      data: bytecode,
      to: null,
    }
    return tx
  }

  public validate(): any {
    if (this.configuratorLogic === zeroAddress) {
      throw new ValidateInputZeroAddressError('CONFIGURATOR_LOGIC')
    }
  }
}
