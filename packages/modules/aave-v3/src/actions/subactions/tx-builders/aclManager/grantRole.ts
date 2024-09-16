import type { Address, Hex } from 'viem'
import { encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type GrantRoleParams = {
  aclManager: Address
  role: Hex
  account: Address
}

export class GrantRoleTxBuilder extends TxBuilder {
  private aclManager: Address
  private role: Hex
  private account: Address

  constructor(client: InfinitWallet, params: GrantRoleParams) {
    super(GrantRoleTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.role = params.role
    this.account = getAddress(params.account)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({ abi: aclManagerArtifact.abi, functionName: 'grantRole', args: [this.role, this.account] })

    const tx: TransactionData = {
      data: callData,
      to: this.aclManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zeroAddress
    if (this.account == zeroAddress) throw new ValidateInputValueError('ROLE_RECEIVER_CANNOT_BE_ZERO_ADDRESS')
    if (this.aclManager == zeroAddress) throw new ValidateInputValueError('ACL_MANAGER_CANNOT_BE_ZERO_ADDRESS')

    // check role
    const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await hasRole(this.client, aclManagerArtifact, this.aclManager, DEFAULT_ADMIN, this.client.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_DEFAULT_ADMIN')
    }
  }
}
