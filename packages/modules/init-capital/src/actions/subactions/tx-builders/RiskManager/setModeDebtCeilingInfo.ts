import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError, ValidateLengthError } from '@infinit-xyz/core/errors'

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
    // validate zero address
    if (this.riskManager === zeroAddress) throw new ValidateInputZeroAddressError('RISK_MANAGER')

    // check length
    if (this.pools.length !== this.ceilAmts.length) {
      throw new ValidateLengthError()
    }

    // get artifacts
    const [riskManagerArtifact, acmArtifact] = await Promise.all([readArtifact('RiskManager'), readArtifact('AccessControlManager')])

    // check role guardian
    const acm: Address = await this.client.publicClient.readContract({
      address: this.riskManager,
      abi: riskManagerArtifact.abi,
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
