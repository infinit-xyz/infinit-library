import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type BeginDefaultAdminTransferTxBuilderParams = {
  accessControlManager: Address
  newOwner: Address
}

export class BeginDefaultAdminTransferTxBuilder extends TxBuilder {
  private newOwner: Address
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: BeginDefaultAdminTransferTxBuilderParams) {
    super(BeginDefaultAdminTransferTxBuilder.name, client)
    this.newOwner = getAddress(params.newOwner)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const encodedData = encodeFunctionData({
      abi: accessControlManagerArtifact.abi,
      functionName: 'beginDefaultAdminTransfer',
      args: [this.newOwner],
    })
    return {
      to: this.accessControlManager,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.accessControlManager === zeroAddress) throw new ValidateInputZeroAddressError('PROXY_ADMIN_CANNOT_BE_ZERO_ADDRESS')
    if (this.newOwner === zeroAddress) throw new ValidateInputZeroAddressError('NEW_OWNER_CANNOT_BE_ZERO_ADDRESS')
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const owner = await this.client.publicClient.readContract({
      address: this.accessControlManager,
      abi: accessControlManagerArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can transfer owner')
  }
}
