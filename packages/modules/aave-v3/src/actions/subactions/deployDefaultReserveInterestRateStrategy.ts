import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  DeployDefaultReserveInterestRateStrategyTxBuilder,
  DeployDefaultReserveInterestRateStrategyTxBuilderParams,
} from '@actions/subactions/tx-builders/defaultReserveInterestRateStrategy/deployDefaultReserveInterestRateStrategy'

import { AaveV3Registry } from '@/src/type'

export type DefaultReserveInterestRateStrategyConfig = {
  name: string
  params: DeployDefaultReserveInterestRateStrategyTxBuilderParams
}

export type DeployDefaultReserveInterestRateStrategySubActionParams = {
  defaultReserveInterestRateStrategyConfigs: DefaultReserveInterestRateStrategyConfig[]
}

export class DeployDefaultReserveInterestRateStrategySubAction extends SubAction<
  DeployDefaultReserveInterestRateStrategySubActionParams,
  AaveV3Registry,
  object
> {
  constructor(client: InfinitWallet, params: DeployDefaultReserveInterestRateStrategySubActionParams) {
    super(DeployDefaultReserveInterestRateStrategySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const defaultReserveInterestRateStrategyConfig of this.params.defaultReserveInterestRateStrategyConfigs) {
      const txBuilder = new DeployDefaultReserveInterestRateStrategyTxBuilder(this.client, defaultReserveInterestRateStrategyConfig.params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const strategyName = this.params.defaultReserveInterestRateStrategyConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (strategyName === undefined) throw new ValidateInputValueError('NO_RESERVE_INTEREST_RATE_STRATEGY_NAME')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'DefaultReserveInterestRateStrategy')
      _.set(registry, ['reserveInterestRateStrategies', strategyName], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
