import _ from 'lodash'

import { Address, Hash, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  DeployAggregatorPythAdapterParams,
  DeployAggregatorPythAdapterTxBuilder,
} from '@actions/subactions/tx-builders/AggregatorPythAdapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type AggregatorPythAdapterConfig = {
  symbol: string
  params: {
    priceId: Hex
  }
}

export type DeployAggregatorPythAdapterSubActionParams = {
  pyth: Address
  aggregatorPythAdapterConfigs: AggregatorPythAdapterConfig[]
}

export class DeployAggregatorPythAdapterSubAction extends SubAction<DeployAggregatorPythAdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployAggregatorPythAdapterSubActionParams) {
    super(DeployAggregatorPythAdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const aggregatorPtyhAdapterConfig of this.params.aggregatorPythAdapterConfigs) {
      const params: DeployAggregatorPythAdapterParams = {
        pyth: this.params.pyth,
        priceId: aggregatorPtyhAdapterConfig.params.priceId,
      }
      const txBuilder = new DeployAggregatorPythAdapterTxBuilder(this.client, params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const symbol = this.params.aggregatorPythAdapterConfigs[index]?.symbol
      // throw error if haven't specify the reserve interest rate strategy name
      if (symbol === undefined) throw new ValidateInputValueError('NO_AGGREGATOR_PYTH_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'AggregatorPythAdapter')
      _.set(registry, ['aggregatorPythAdapters', symbol], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
