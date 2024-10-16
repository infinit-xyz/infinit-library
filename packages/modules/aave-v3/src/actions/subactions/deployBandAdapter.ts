import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployBandAdapterParams, DeployBandAdapterTxBuilder } from '@actions/subactions/tx-builders/BandAdapter/deploy'

import { AaveV3Registry } from '@/src/type'

export type BandAdapterConfig = {
  name: string
} & Omit<DeployBandAdapterParams, 'ref'>

export type DeployBandAdapterSubActionParams = {
  bandAdapterConfigs: BandAdapterConfig[]
} & Pick<DeployBandAdapterParams, 'ref'>

export class DeployBandAdapterSubAction extends SubAction<DeployBandAdapterSubActionParams, AaveV3Registry, object> {
  constructor(client: InfinitWallet, params: DeployBandAdapterSubActionParams) {
    super(DeployBandAdapterSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const bandAdapterConfig of this.params.bandAdapterConfigs) {
      const { base, quote } = bandAdapterConfig
      const params: DeployBandAdapterParams = {
        ref: this.params.ref,
        base: base,
        quote: quote,
      }
      const txBuilder = new DeployBandAdapterTxBuilder(this.client, params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const name = this.params.bandAdapterConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (name === undefined) throw new ValidateInputValueError('NO_BAND_ADAPTER_SYMBOL')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'BandAdapter')
      _.set(registry, ['bandAdapters', name], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
