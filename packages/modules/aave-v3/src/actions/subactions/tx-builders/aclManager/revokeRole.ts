import type { Address, Hex } from 'viem'
import { encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type RevokeRoleParams = {
  aclManager: Address
  role: Hex
  account: Address
}

export class RevokeRoleTxBuilder extends TxBuilder {
  private aclManager: Address
  private role: Hex
  private account: Address

  constructor(client: InfinitWallet, params: RevokeRoleParams) {
    super(RevokeRoleTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.role = params.role
    this.account = getAddress(params.account)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({ abi: aclManagerArtifact.abi, functionName: 'revokeRole', args: [this.role, this.account] })

    const tx: TransactionData = {
      data: callData,
      to: this.aclManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zeroAddress
    if (this.account === zeroAddress) throw new ValidateInputZeroAddressError('ACCOUNT')
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
