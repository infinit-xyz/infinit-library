import { Address, Hex, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetAddressAsProxyParams = {
  poolAddressesProvider: Address
  id: Hex
  implementationAddress: Address
}

export class SetAddressAsProxyTxBuilder extends TxBuilder {
  poolAddressesProvider: Address
  id: Hex
  implementationAddress: Address

  constructor(client: InfinitWallet, params: SetAddressAsProxyParams) {
    super(SetAddressAsProxyTxBuilder.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.id = params.id
    this.implementationAddress = getAddress(params.implementationAddress)
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({
      abi: providerArtifact.abi,
      functionName: 'setAddressAsProxy',
      args: [this.id, this.implementationAddress],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')
    const owner = await this.client.publicClient.readContract({
      address: this.poolAddressesProvider,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) throw new ContractValidateError('caller is not owner')
  }
}
