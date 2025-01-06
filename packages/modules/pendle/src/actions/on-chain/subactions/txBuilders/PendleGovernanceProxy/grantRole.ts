import { Address, Hex, encodeFunctionData, getAddress, isHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface GrantRolePendleGovernanceProxyTxBuilderParams {
  pendleGovernanceProxy: Address
  role: Hex
  account: Address
}

export class GrantRolePendleGovernanceProxyTxBuilder extends TxBuilder {
  public pendleGovernanceProxy: Address
  public role: Hex
  public account: Address

  constructor(client: InfinitWallet, params: GrantRolePendleGovernanceProxyTxBuilderParams) {
    super(GrantRolePendleGovernanceProxyTxBuilder.name, client)
    this.pendleGovernanceProxy = getAddress(params.pendleGovernanceProxy)
    this.role = params.role
    this.account = getAddress(params.account)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGovernanceProxyArtifact = await readArtifact('PendleGovernanceProxy')

    const functionData = encodeFunctionData({
      abi: pendleGovernanceProxyArtifact.abi,
      functionName: 'grantRole',
      args: [this.role, this.account],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleGovernanceProxy,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleGovernanceProxy === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_GOVERNANCE_PROXY')
    if (this.account === zeroAddress) throw new ValidateInputZeroAddressError('ACCOUNT')
    if (!isHex(this.role)) throw new ValidateInputValueError('Role should be a hex string')
    if (this.role.length === 32) throw new ValidateInputValueError('Role should be 32 bytes')
  }
}
