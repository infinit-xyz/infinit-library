import { Address, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployDefaultReserveInterestRateStrategyTxBuilderParams = {
  poolAddressesProvider: Address
  optimalUsageRatio: bigint
  baseVariableBorrowRate: bigint
  variableRateSlope1: bigint
  variableRateSlope2: bigint
  stableRateSlope1: bigint
  stableRateSlope2: bigint
  baseStableRateOffset: bigint
  stableRateExcessOffset: bigint
  optimalStableToTotalDebtRatio: bigint
}

export class DeployDefaultReserveInterestRateStrategyTxBuilder extends TxBuilder {
  private deployInterestRateStrategyParams: DeployDefaultReserveInterestRateStrategyTxBuilderParams

  constructor(client: InfinitWallet, params: DeployDefaultReserveInterestRateStrategyTxBuilderParams) {
    super(DeployDefaultReserveInterestRateStrategyTxBuilder.name, client)
    this.deployInterestRateStrategyParams = { ...params, poolAddressesProvider: getAddress(params.poolAddressesProvider) }
  }

  async buildTx(): Promise<TransactionData> {
    const defaultReserveInterestRateStrategyArtifact = await readArtifact('DefaultReserveInterestRateStrategy')
    const params = this.deployInterestRateStrategyParams

    const args: [Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] = [
      params.poolAddressesProvider,
      params.optimalUsageRatio,
      params.baseVariableBorrowRate,
      params.variableRateSlope1,
      params.variableRateSlope2,
      params.stableRateSlope1,
      params.stableRateSlope2,
      params.baseStableRateOffset,
      params.stableRateExcessOffset,
      params.optimalStableToTotalDebtRatio,
    ]

    const encodedData = encodeDeployData({
      abi: defaultReserveInterestRateStrategyArtifact.abi,
      bytecode: defaultReserveInterestRateStrategyArtifact.bytecode,
      args: args,
    })

    const tx: TransactionData = {
      data: encodedData,
      to: null,
    }

    return tx
  }

  public async validate(): Promise<void> {
    const params = this.deployInterestRateStrategyParams
    if (params.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('POOL_ADDRESS_PROVIDER_IS_ZERO_ADDRESS')
    if (params.variableRateSlope1 > params.variableRateSlope2)
      throw new ValidateInputValueError('VARIABLE_RATE_SLOPE_1_GREATER_THAN_VARIABLE_RATE_SLOPE_2')
    if (params.stableRateSlope1 > params.stableRateSlope2)
      throw new ValidateInputValueError('STABLE_RATE_SLOPE_1_GREATER_THAN_STABLE_RATE_SLOPE_2')
  }
}
