import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface InitializePendleGovernanceProxyTxBuilderParams {
  pendleGovernanceProxy: Address
  governance: Address
}

export class InitializePendleGovernanceProxyTxBuilder extends TxBuilder {
  public pendleGovernanceProxy: Address
  public governance: Address

  constructor(client: InfinitWallet, params: InitializePendleGovernanceProxyTxBuilderParams) {
    super(InitializePendleGovernanceProxyTxBuilder.name, client)
    this.pendleGovernanceProxy = getAddress(params.pendleGovernanceProxy)
    this.governance = getAddress(params.governance)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGovernanceProxyArtifact = await readArtifact('PendleGovernanceProxy')

    const functionData = encodeFunctionData({
      abi: pendleGovernanceProxyArtifact.abi,
      functionName: 'initialize',
      args: [this.governance],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleGovernanceProxy,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleGovernanceProxy === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_GOVERNANCE_PROXY')
    if (this.governance === zeroAddress) throw new ValidateInputZeroAddressError('GOVERNANCE')
  }
}
