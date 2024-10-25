import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type ModeStatus = {
  canCollateralize: boolean
  canDecollateralize: boolean
  canBorrow: boolean
  canRepay: boolean
}

export type SetModeStatusTxBuilderParams = {
  config: Address
  mode: number
  status: ModeStatus
}

export class SetModeStatusTxBuilder extends TxBuilder {
  config: Address
  mode: number
  status: ModeStatus

  constructor(client: InfinitWallet, params: SetModeStatusTxBuilderParams) {
    super(SetModeStatusTxBuilder.name, client)
    this.config = getAddress(params.config)
    this.mode = params.mode
    this.status = params.status
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setModeStatus',
      args: [this.mode, this.status],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.config === zeroAddress) {
      throw new ValidateInputZeroAddressError('CONFIG')
    }

    const [configArtifact, acmArtifact] = await Promise.all([readArtifact('Config'), readArtifact('AccessControlManager')])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.config,
      abi: configArtifact.abi,
      functionName: 'ACM',
      args: [],
    })
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('guardian')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GUARDIAN')
    }
  }
}
