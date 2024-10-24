import { Address, Hex, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type AddGuardianTxBuilderParams = {
  accessControlManager: Address
  guardian: Address
}

export class AddGuardianTxBuilder extends TxBuilder {
  private accessControlManager: Address
  private guardian: Address
  private role: Hex

  constructor(client: InfinitWallet, params: AddGuardianTxBuilderParams) {
    super(AddGuardianTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
    this.guardian = getAddress(params.guardian)
    this.role = keccak256(toHex('guardian'))
  }

  async buildTx(): Promise<TransactionData> {
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')

    const callData = encodeFunctionData({
      abi: accessControlManagerArtifact.abi,
      functionName: 'grantRole',
      args: [this.role, this.guardian],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.accessControlManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.guardian === zeroAddress) throw new ValidateInputZeroAddressError('POOL_ADMIN')
    if (this.accessControlManager === zeroAddress) throw new ValidateInputZeroAddressError('ACL_MANAGER')

    // check role
    const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const flag = await hasRole(
      this.client,
      accessControlManagerArtifact,
      this.accessControlManager,
      DEFAULT_ADMIN,
      this.client.walletClient.account.address,
    )
    if (!flag) {
      throw new ContractValidateError('NOT_DEFAULT_ADMIN')
    }
  }
}
