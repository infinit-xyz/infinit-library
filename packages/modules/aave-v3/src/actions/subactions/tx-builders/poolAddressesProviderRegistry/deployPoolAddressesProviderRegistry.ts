import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPoolAddressesProviderRegistryParams = {
  owner: Address
}

export class DeployPoolAddressesProviderRegistryTxBuilder extends TxBuilder {
  private owner: Address

  constructor(client: InfinitWallet, params: DeployPoolAddressesProviderRegistryParams) {
    super(DeployPoolAddressesProviderRegistryTxBuilder.name, client)
    this.owner = getAddress(params.owner)
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderRegistry = await readArtifact('PoolAddressesProviderRegistry')
    const deployData = encodeDeployData({
      abi: poolAddressesProviderRegistry.abi,
      bytecode: poolAddressesProviderRegistry.bytecode as Hex,
      args: [this.owner],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
