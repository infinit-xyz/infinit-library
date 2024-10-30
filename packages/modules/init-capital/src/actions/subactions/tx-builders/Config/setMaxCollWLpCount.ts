import { Address, encodeFunctionData, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetMaxCollWLpCountTxBuilderParams = {
  config: Address
  mode: number
  maxCollWLpCount: number
}

export class SetMaxCollWLpCountTxBuilder extends TxBuilder {
  public config: Address
  public mode: number
  public maxCollWLpCount: number

  constructor(client: InfinitWallet, params: SetMaxCollWLpCountTxBuilderParams) {
    super(SetMaxCollWLpCountTxBuilder.name, client)
    this.config = params.config
    this.mode = params.mode
    this.maxCollWLpCount = params.maxCollWLpCount
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setMaxCollWLpCount',
      args: [this.mode, this.maxCollWLpCount],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG')
    const acmArtifact = await readArtifact('AccessControlManager')
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: this.config,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('guardian')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GUARDIAN')
    }
  }
}
