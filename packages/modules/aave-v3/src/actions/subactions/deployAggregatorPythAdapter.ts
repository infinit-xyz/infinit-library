import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  DeployAggregatorPythAdapterParams,
  DeployAggregatorPythAdapterTxBuilder,
} from '@actions/subactions/tx-builders/AggregatorPythAdapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type AggregatorPythAdapterConfig = {
  name: string
} & Omit<DeployAggregatorPythAdapterParams, 'pyth'>

export type DeployAggregatorPythAdapterSubActionParams = {
  aggregatorPythAdapterConfigs: AggregatorPythAdapterConfig[]
} & Pick<DeployAggregatorPythAdapterParams, 'pyth'>

export class DeployAggregatorPythAdapterSubAction extends SubAction<DeployAggregatorPythAdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployAggregatorPythAdapterSubActionParams) {
    super(DeployAggregatorPythAdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const aggregatorPythAdapterConfig of this.params.aggregatorPythAdapterConfigs) {
      const { priceId } = aggregatorPythAdapterConfig
      const params: DeployAggregatorPythAdapterParams = {
        pyth: this.params.pyth,
        priceId: priceId,
      }
      const txBuilder = new DeployAggregatorPythAdapterTxBuilder(this.client, params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const name = this.params.aggregatorPythAdapterConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (name === undefined) throw new ValidateInputValueError('NO_AGGREGATOR_PYTH_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'AggregatorPythAdapter')
      _.set(registry, ['aggregatorPythAdapters', name], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
