import { Address, encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type AddPoolAdminACLManagerParams = {
  aclManager: Address
  poolAdmin: Address
}

export class AddPoolAdminACLManagerTxBuilder extends TxBuilder {
  private aclManager: Address
  private poolAdmin: Address

  constructor(client: InfinitWallet, params: AddPoolAdminACLManagerParams) {
    super(AddPoolAdminACLManagerTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.poolAdmin = getAddress(params.poolAdmin)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({ abi: aclManagerArtifact.abi, functionName: 'addPoolAdmin', args: [this.poolAdmin] })

    const tx: TransactionData = {
      data: callData,
      to: this.aclManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.poolAdmin === zeroAddress) throw new ValidateInputZeroAddressError('POOL_ADMIN')
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
