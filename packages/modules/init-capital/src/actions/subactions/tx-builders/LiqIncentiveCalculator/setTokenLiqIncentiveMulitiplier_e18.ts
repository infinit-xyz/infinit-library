import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import {
  ContractValidateError,
  ValidateInputValueError,
  ValidateInputZeroAddressError,
  ValidateLengthError,
} from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetTokenLiqIncentiveMultiplierE18TxBuilderParams = {
  liqIncentiveCalculator: Address
  tokens: Address[]
  multipliers_e18: bigint[]
}

export class SetTokenLiqIncentiveMultiplierE18TxBuilder extends TxBuilder {
  private liqIncentiveCalculator: Address
  private tokens: Address[]
  private multipliers_e18: bigint[]

  constructor(client: InfinitWallet, params: SetTokenLiqIncentiveMultiplierE18TxBuilderParams) {
    super(SetTokenLiqIncentiveMultiplierE18TxBuilder.name, client)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.multipliers_e18 = params.multipliers_e18
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    const functionData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'setTokenLiqIncentiveMultiplier_e18',
      args: [this.tokens, this.multipliers_e18],
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
    if (this.tokens.length !== this.multipliers_e18.length) {
      throw new ValidateLengthError()
    }

    this.multipliers_e18.forEach((multiplier_e18) => {
      if (multiplier_e18 < 0n) throw new ValidateInputValueError('Token Liquidation Incentive Multiplier cannot be negative')
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
