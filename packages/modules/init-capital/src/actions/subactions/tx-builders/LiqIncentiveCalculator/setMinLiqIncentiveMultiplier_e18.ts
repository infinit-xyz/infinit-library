import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import {
  ContractValidateError,
  ValidateInputValueError,
  ValidateInputZeroAddressError,
  ValidateLengthError,
} from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetMinLiqIncentiveMultiplierE18TxBuilderParams = {
  liqIncentiveCalculator: Address
  modes: number[]
  minMultipliers_e18: bigint[]
}

export class SetMinLiqIncentiveMultiplierE18TxBuilder extends TxBuilder {
  public liqIncentiveCalculator: Address
  public modes: number[]
  public minMultipliers_e18: bigint[]

  constructor(client: InfinitWallet, params: SetMinLiqIncentiveMultiplierE18TxBuilderParams) {
    super(SetMinLiqIncentiveMultiplierE18TxBuilder.name, client)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.modes = params.modes
    this.minMultipliers_e18 = params.minMultipliers_e18
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    const functionData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'setMinLiqIncentiveMultiplier_e18',
      args: [this.modes, this.minMultipliers_e18],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.liqIncentiveCalculator,
    }

    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.liqIncentiveCalculator === zeroAddress) throw new ValidateInputZeroAddressError('LIQ_INCENTIVE_CALCULATOR')

    // check length
    if (this.modes.length !== this.minMultipliers_e18.length) {
      throw new ValidateLengthError()
    }

    this.minMultipliers_e18.forEach((multiplier_e18) => {
      if (multiplier_e18 < 0n) throw new ValidateInputValueError('Mode Liquidation Incentive Multiplier cannot be negative')
    })

    // check governor role
    const [api3ProxyOracleReaderArtifact, acmArtifact] = await Promise.all([
      readArtifact('LiqIncentiveCalculator'),
      readArtifact('AccessControlManager'),
    ])

    const acm: Address = await this.client.publicClient.readContract({
      address: this.liqIncentiveCalculator,
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'ACM',
      args: [],
    })
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('governor')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GOVERNOR')
    }
  }
}
