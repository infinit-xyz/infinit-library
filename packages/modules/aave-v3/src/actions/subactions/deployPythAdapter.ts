import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployPythAdapterParams, DeployPythAdapterTxBuilder } from '@actions/subactions/tx-builders/PythAdapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type PythAdapterConfig = {
  name: string
} & Omit<DeployPythAdapterParams, 'pyth'>

export type DeployPythAdapterSubActionParams = {
  pythAdapterConfigs: PythAdapterConfig[]
} & Pick<DeployPythAdapterParams, 'pyth'>

export class DeployPythAdapterSubAction extends SubAction<DeployPythAdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployPythAdapterSubActionParams) {
    super(DeployPythAdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const pythAdapterConfig of this.params.pythAdapterConfigs) {
      const { priceId } = pythAdapterConfig
      const params: DeployPythAdapterParams = {
        pyth: this.params.pyth,
        priceId: priceId,
      }
      const txBuilder = new DeployPythAdapterTxBuilder(this.client, params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const name = this.params.pythAdapterConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (name === undefined) throw new ValidateInputValueError('NO_PYTH_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'PythAdapter')
      _.set(registry, ['pythAdapters', name], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
