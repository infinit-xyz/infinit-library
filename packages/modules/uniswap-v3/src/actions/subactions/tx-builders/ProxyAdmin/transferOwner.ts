import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type TransferOwnerTxBuilderParams = {
  proxyAdmin: Address
  newOwner: Address
}

export class TransferOwnerTxBuilder extends TxBuilder {
  private newOwner: Address
  private proxyAdmin: Address

  constructor(client: InfinitWallet, params: TransferOwnerTxBuilderParams) {
    super(TransferOwnerTxBuilder.name, client)
    this.newOwner = getAddress(params.newOwner)
    this.proxyAdmin = getAddress(params.proxyAdmin)
  }

  async buildTx(): Promise<TransactionData> {
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')
    const encodedData = encodeFunctionData({ abi: proxyAdminArtifact.abi, functionName: 'transferOwnership', args: [this.newOwner] })
    return {
      to: this.proxyAdmin,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.proxyAdmin === zeroAddress) throw new ValidateInputZeroAddressError('PROXY_ADMIN')
    if (this.newOwner === zeroAddress) throw new ValidateInputZeroAddressError('NEW_OWNER')
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')
    const owner = await this.client.publicClient.readContract({
      address: this.proxyAdmin,
      abi: proxyAdminArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can transfer owner')
  }
}
