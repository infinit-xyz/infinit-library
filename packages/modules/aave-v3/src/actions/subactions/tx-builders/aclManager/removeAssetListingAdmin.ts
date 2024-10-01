import type { Address } from 'viem'
import { encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type RemoveAssetListingAdminParams = {
  aclManager: Address
  assetListingAdmin: Address
}

export class RemoveAssetListingAdminTxBuilder extends TxBuilder {
  private aclManager: Address
  private assetListingAdmin: Address

  constructor(client: InfinitWallet, params: RemoveAssetListingAdminParams) {
    super(RemoveAssetListingAdminTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.assetListingAdmin = getAddress(params.assetListingAdmin)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({
      abi: aclManagerArtifact.abi,
      functionName: 'removeAssetListingAdmin',
      args: [this.assetListingAdmin],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.aclManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zeroAddress
    if (this.assetListingAdmin === zeroAddress) throw new ValidateInputZeroAddressError('ASSET_LISTING_ADMIN')
    if (this.aclManager === zeroAddress) throw new ValidateInputZeroAddressError('ACL_MANAGER')

    // check role
    const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await hasRole(this.client, aclManagerArtifact, this.aclManager, DEFAULT_ADMIN, this.client.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_DEFAULT_ADMIN')
    }
  }
}
