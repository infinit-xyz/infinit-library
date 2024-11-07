import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetModeDebtCeilingInfoTxBuilderParams = {
  riskManager: Address
  mode: number
  pools: Address[]
  ceilAmts: bigint[]
}

export class SetModeDebtCeilingInfoTxBuilder extends TxBuilder {
  private riskManager: Address
  private mode: number
  private pools: Address[]
  private ceilAmts: bigint[]

  constructor(client: InfinitWallet, params: SetModeDebtCeilingInfoTxBuilderParams) {
    super(SetModeDebtCeilingInfoTxBuilder.name, client)
    this.riskManager = getAddress(params.riskManager)
    this.mode = params.mode
    this.pools = params.pools
    this.ceilAmts = params.ceilAmts
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('RiskManager')
    const functionData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'setModeDebtCeilingInfo',
      args: [this.mode, this.pools, this.ceilAmts],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.riskManager,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.riskManager === zeroAddress) throw new ValidateInputZeroAddressError('RISK_MANAGER')
    // TODO: check guardian
  }
}
