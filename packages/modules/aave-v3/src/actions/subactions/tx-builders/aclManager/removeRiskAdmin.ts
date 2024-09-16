import type { Address } from 'viem'
import { encodeFunctionData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type RemoveRiskAdminParams = {
  aclManager: Address
  riskAdmin: Address
}

export class RemoveRiskAdminTxBuilder extends TxBuilder {
  private aclManager: Address
  private riskAdmin: Address

  constructor(client: InfinitWallet, params: RemoveRiskAdminParams) {
    super(RemoveRiskAdminTxBuilder.name, client)
    this.aclManager = getAddress(params.aclManager)
    this.riskAdmin = getAddress(params.riskAdmin)
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const callData = encodeFunctionData({ abi: aclManagerArtifact.abi, functionName: 'removeRiskAdmin', args: [this.riskAdmin] })

    const tx: TransactionData = {
      data: callData,
      to: this.aclManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zeroAddress
    if (this.riskAdmin === zeroAddress) throw new ValidateInputValueError('RISK_ADMIN_CANNOT_BE_ZERO_ADDRESS')
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
