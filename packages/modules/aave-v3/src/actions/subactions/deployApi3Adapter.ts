import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployApi3AdapterParams, DeployApi3AdapterTxBuilder } from '@actions/subactions/tx-builders/Api3Adapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type Api3AdapterConfig = {
  name: string
} & DeployApi3AdapterParams

export type DeployApi3AdapterSubActionParams = {
  api3AdapterConfigs: Api3AdapterConfig[]
}

export class DeployApi3AdapterSubAction extends SubAction<DeployApi3AdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployApi3AdapterSubActionParams) {
    super(DeployApi3AdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const api3AdapterConfig of this.params.api3AdapterConfigs) {
      const { dataFeedProxy } = api3AdapterConfig
      const txBuilder = new DeployApi3AdapterTxBuilder(this.client, { dataFeedProxy })
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const name = this.params.api3AdapterConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (name === undefined) throw new ValidateInputValueError('NO_API3_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'Api3Adapter')
      _.set(registry, ['api3Adapters', name], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
