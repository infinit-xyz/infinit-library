import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetModeLiqIncentiveMultiplierE18TxBuilderParams = {
  liqIncentiveCalculator: Address
  modes: number[]
  multipliers_e18: bigint[]
}

export class SetModeLiqIncentiveMultiplierE18TxBuilder extends TxBuilder {
  private liqIncentiveCalculator: Address
  private modes: number[]
  private multipliers_e18: bigint[]

  constructor(client: InfinitWallet, params: SetModeLiqIncentiveMultiplierE18TxBuilderParams) {
    super(SetModeLiqIncentiveMultiplierE18TxBuilder.name, client)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.modes = params.modes
    this.multipliers_e18 = params.multipliers_e18
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    const functionData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'setModeLiqIncentiveMultiplier_e18',
      args: [this.modes, this.multipliers_e18],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.liqIncentiveCalculator,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.liqIncentiveCalculator === zeroAddress) throw new ValidateInputZeroAddressError('LIQ_INCENTIVE_CALCULATOR')

    this.multipliers_e18.forEach((multiplier_e18) => {
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
