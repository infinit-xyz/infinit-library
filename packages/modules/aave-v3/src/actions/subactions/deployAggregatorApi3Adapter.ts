import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  DeployAggregatorApi3AdapterParams,
  DeployAggregatorApi3AdapterTxBuilder,
} from '@actions/subactions/tx-builders/AggregatorApi3Adapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type AggregatorApi3AdapterConfig = {
  name: string
} & DeployAggregatorApi3AdapterParams

export type DeployAggregatorApi3AdapterSubActionParams = {
  aggregatorApi3AdapterConfigs: AggregatorApi3AdapterConfig[]
}

export class DeployAggregatorApi3AdapterSubAction extends SubAction<DeployAggregatorApi3AdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployAggregatorApi3AdapterSubActionParams) {
    super(DeployAggregatorApi3AdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const aggregatorApi3AdapterConfig of this.params.aggregatorApi3AdapterConfigs) {
      const { dataFeedProxy } = aggregatorApi3AdapterConfig
      const txBuilder = new DeployAggregatorApi3AdapterTxBuilder(this.client, { dataFeedProxy })
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const name = this.params.aggregatorApi3AdapterConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (name === undefined) throw new ValidateInputValueError('NO_AGGREGATOR_API3_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'AggregatorApi3Adapter')
      _.set(registry, ['aggregatorApi3Adapters', name], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
