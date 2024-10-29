import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeLiqIncentiveCalculatorTxBuilderParams = {
  liqIncentiveCalculator: Address
  logic: Address
  admin: Address
  maxLiqIncentiveMultiplier: bigint
}

export class InitializeLiqIncentiveCalculatorTxBuilder extends TxBuilder {
  private liqIncentiveCalculator: Address
  private logic: Address
  private admin: Address
  private maxLiqIncentiveMultiplier: bigint

  constructor(client: InfinitWallet, params: InitializeLiqIncentiveCalculatorTxBuilderParams) {
    super(InitializeLiqIncentiveCalculatorTxBuilder.name, client)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
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
    if (this.liqIncentiveCalculator === zeroAddress)
      throw new ValidateInputZeroAddressError('LIQ_INCENTIVE_CALCULATOR_CANNOT_BE_ZERO_ADDRESS')
    if (this.logic === zeroAddress) throw new ValidateInputZeroAddressError('LOGIC_CANNOT_BE_ZERO_ADDRESS')
    if (this.admin === zeroAddress) throw new ValidateInputZeroAddressError('ADMIN_CANNOT_BE_ZERO_ADDRESS')
  }
}
