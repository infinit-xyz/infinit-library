import { Address, encodeFunctionData, getAddress, maxUint256, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeLiqIncentiveCalculatorTxBuilderParams = {
  liqIncentiveCalculator: Address
  maxLiqIncentiveMultiplier: bigint
}

export class InitializeLiqIncentiveCalculatorTxBuilder extends TxBuilder {
  private liqIncentiveCalculator: Address
  private maxLiqIncentiveMultiplier: bigint

  constructor(client: InfinitWallet, params: InitializeLiqIncentiveCalculatorTxBuilderParams) {
    super(InitializeLiqIncentiveCalculatorTxBuilder.name, client)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.maxLiqIncentiveMultiplier = params.maxLiqIncentiveMultiplier
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    const functionData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'initialize',
      args: [this.maxLiqIncentiveMultiplier],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.liqIncentiveCalculator,
    }

    return tx
  }

  public async validate(): Promise<void> {
    if (this.liqIncentiveCalculator === zeroAddress) throw new ValidateInputZeroAddressError('LIQ_INCENTIVE_CALCULATOR')
    if (this.maxLiqIncentiveMultiplier < 0n) throw new ValidateInputValueError('Max Liquidation Incentive Multiplier cannot be negative')
    if (this.maxLiqIncentiveMultiplier > maxUint256)
      throw new ValidateInputValueError(`Max Liquidation Incentive Multiplier cannot be greater than ${maxUint256}`)
  }
}
