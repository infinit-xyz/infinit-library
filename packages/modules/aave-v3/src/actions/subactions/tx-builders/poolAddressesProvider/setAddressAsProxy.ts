import { Address, Hex, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetAddressAsProxyParams = {
  poolAddressProvider: Address
  id: Hex
  implementationAddress: Address
}

export class SetAddressAsProxyTxBuilder extends TxBuilder {
  poolAddressProvider: Address
  id: Hex
  implementationAddress: Address

  constructor(client: InfinitWallet, params: SetAddressAsProxyParams) {
    super(SetAddressAsProxyTxBuilder.name, client)
    this.poolAddressProvider = params.poolAddressProvider
    this.id = params.id
    this.implementationAddress = params.implementationAddress
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({
      abi: providerArtifact.abi,
      functionName: 'SetAddressAsProxy',
      args: [this.implementationAddress],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')
    const owner = await this.client.publicClient.readContract({
      address: this.poolAddressProvider,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) throw new ContractValidateError('caller is not owner')
  }
}
