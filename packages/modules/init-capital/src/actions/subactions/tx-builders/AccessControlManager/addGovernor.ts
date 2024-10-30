import { Address, Hex, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type AddGovernorTxBuilderParams = {
  accessControlManager: Address
  governor: Address
}

export class AddGovernorTxBuilder extends TxBuilder {
  private accessControlManager: Address
  private governor: Address
  private role: Hex

  constructor(client: InfinitWallet, params: AddGovernorTxBuilderParams) {
    super(AddGovernorTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
    this.governor = getAddress(params.governor)
    this.role = keccak256(toHex('governor'))
  }

  async buildTx(): Promise<TransactionData> {
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')

    const callData = encodeFunctionData({
      abi: accessControlManagerArtifact.abi,
      functionName: 'grantRole',
      args: [this.role, this.governor],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.accessControlManager,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.governor === zeroAddress) throw new ValidateInputZeroAddressError('GOVERNOR')
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
