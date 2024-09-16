import { Address, encodeFunctionData, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

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
    this.aclManager = params.aclManager
    this.poolAdmin = params.poolAdmin
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
    if (this.poolAdmin === zeroAddress) throw new ValidateInputValueError('poolAdmin provider cannot be zero address')
    if (this.aclManager === zeroAddress) throw new ValidateInputValueError('pool address provider cannot be zero address')

    // check role
    const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await hasRole(this.client, aclManagerArtifact, this.aclManager, DEFAULT_ADMIN, this.client.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_DEFAULT_ADMIN')
    }
  }
}
