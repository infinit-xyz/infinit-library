import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetEmissionAdminParams = {
  emissionManager: Address
  reward: Address
  admin: Address
}

export class SetEmissionAdminTxBuilder extends TxBuilder {
  emissionManager: Address
  reward: Address
  admin: Address

  constructor(client: InfinitWallet, params: SetEmissionAdminParams) {
    super(SetEmissionAdminTxBuilder.name, client)
    this.emissionManager = getAddress(params.emissionManager)
    this.reward = getAddress(params.reward)
    this.admin = getAddress(params.admin)
  }

  async buildTx(): Promise<TransactionData> {
    const emissionManagerArtifact = await readArtifact('EmissionManager')

    const callData = encodeFunctionData({
      abi: emissionManagerArtifact.abi,
      functionName: 'setEmissionAdmin',
      args: [this.reward, this.admin],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.emissionManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.emissionManager === zeroAddress) throw new ContractValidateError('emissionManager cannot be zero address')
    if (this.reward === zeroAddress) throw new ContractValidateError('reward cannot be zero address')

    const poolAddressesProviderArtifact = await readArtifact('EmissionManager')
    const owner = await this.client.publicClient.readContract({
      address: this.emissionManager,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) throw new ContractValidateError('caller is not owner')
  }
}
