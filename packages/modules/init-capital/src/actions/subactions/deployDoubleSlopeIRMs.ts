import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployDoubleSlopeIRMTxBuilder, DeployDoubleSlopeIRMTxBuilderParams } from '@actions/subactions/tx-builders/DoubleSlopeIRM/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DoubleSlopeIRMConfig = {
  name: string
  params: DeployDoubleSlopeIRMTxBuilderParams
}

export type DeployDoubleSlopeIRMsSubActionParams = {
  doubleSlopeIRMConfigs: DoubleSlopeIRMConfig[]
}

export class DeployDoubleSlopeIRMsSubAction extends SubAction<DeployDoubleSlopeIRMsSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: DeployDoubleSlopeIRMsSubActionParams) {
    super(DeployDoubleSlopeIRMsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add default reserve interest rate strategy txs
    for (const defaultDoubleSlopeIRMConfig of this.params.doubleSlopeIRMConfigs) {
      const txBuilder = new DeployDoubleSlopeIRMTxBuilder(this.client, defaultDoubleSlopeIRMConfig.params)
      this.txBuilders.push(txBuilder)
    }
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    // update registry mapping name from txHashes
    for (const [index, txHash] of txHashes.entries()) {
      const irmName = this.params.doubleSlopeIRMConfigs[index]?.name
      // throw error if haven't specify the reserve interest rate strategy name
      if (irmName === undefined) throw new ValidateInputValueError('NO_RESERVE_INTEREST_RATE_STRATEGY_NAME')

      // get deployed address from the txHash
      const { contractAddress } = await this.client.publicClient.waitForTransactionReceipt({ hash: txHash })

      // set contract address to registry
      if (!contractAddress) throw new ContractNotFoundError(txHash, 'DoubleSlopeIRM: ' + irmName)
      _.set(registry, ['irms', irmName], contractAddress)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
