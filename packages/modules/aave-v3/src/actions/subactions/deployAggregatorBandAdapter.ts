import _ from 'lodash'

import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  DeployAggregatorBandAdapterParams,
  DeployAggregatorBandAdapterTxBuilder,
} from '@actions/subactions/tx-builders/AggregatorBandAdapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type AggregatorBandAdapterConfig = {
  symbol: string
  params: {
    base: string
    quote: string
  }
}

export type DeployAggregatorBandAdapterSubActionParams = {
  ref: Address
  aggregatorBandAdapterConfigs: AggregatorBandAdapterConfig[]
}

export class DeployAggregatorBandAdapterSubAction extends SubAction<DeployAggregatorBandAdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployAggregatorBandAdapterSubActionParams) {
    super(DeployAggregatorBandAdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const aggregatorBandAdapterConfig of this.params.aggregatorBandAdapterConfigs) {
      const params: DeployAggregatorBandAdapterParams = {
        ref: this.params.ref,
        base: aggregatorBandAdapterConfig.params.base,
        quote: aggregatorBandAdapterConfig.params.quote,
      }
      const txBuilder = new DeployAggregatorBandAdapterTxBuilder(this.client, params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const symbol = this.params.aggregatorBandAdapterConfigs[index]?.symbol
      // throw error if haven't specify the reserve interest rate strategy name
      if (symbol === undefined) throw new ValidateInputValueError('NO_AGGREGATOR_BAND_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'AggregatorBandAdapter')
      _.set(registry, ['aggregatorBandAdapters', symbol], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
