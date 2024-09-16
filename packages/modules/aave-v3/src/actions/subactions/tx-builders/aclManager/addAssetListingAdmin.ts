import type { Address } from 'viem'
import { encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type AddAssetListingAdminParams = {
  aclManager: Address
  assetListingAdmin: Address
}

export class AddAssetListingAdminTxBuilder extends TxBuilder {
  private aclManager: Address
  private assetListingAdmin: Address

  constructor(client: InfinitWallet, params: AddAssetListingAdminParams) {
    super(AddAssetListingAdminTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.assetListingAdmin = getAddress(params.assetListingAdmin)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({
      abi: aclManagerArtifact.abi,
      functionName: 'addAssetListingAdmin',
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
    if (this.assetListingAdmin === zeroAddress) throw new ValidateInputValueError('ASSET_LISTING_ADMIN_CANNOT_BE_ZERO_ADDRESS')
    if (this.aclManager === zeroAddress) throw new ValidateInputValueError('ACL_MANAGER_CANNOT_BE_ZERO_ADDRESS')

    // check role
    const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await hasRole(this.client, aclManagerArtifact, this.aclManager, DEFAULT_ADMIN, this.client.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_DEFAULT_ADMIN')
    }
  }
}
