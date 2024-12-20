import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleGaugeControllerMainchainUpgTxBuilder,
  DeployPendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleGaugeControllerMainchainUpg/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleGaugeControllerMainchainUpgSubactionParams = DeployPendleGaugeControllerMainchainUpgTxBuilderParams

export type DeployPendleGaugeControllerMainchainUpgSubactionMsg = {
  pendleGaugeControllerMainchainUpg: Address
}
export class DeployPendleGaugeControllerMainchainUpgSubaction extends SubAction<
  DeployPendleGaugeControllerMainchainUpgSubactionParams,
  PendleV3Registry,
  DeployPendleGaugeControllerMainchainUpgSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(DeployPendleGaugeControllerMainchainUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployPendleGaugeControllerMainchainUpgSubactionMsg>> {
    const [deployPendleGaugeControllerMainchainUpgTxHash] = txHashes
    const { contractAddress: pendleGaugeControllerMainchainUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleGaugeControllerMainchainUpgTxHash,
    })
    if (!pendleGaugeControllerMainchainUpg) {
      throw new ContractNotFoundError(deployPendleGaugeControllerMainchainUpgTxHash, 'PendleGaugeControllerMainchainUpg')
    }
    registry.pendleGaugeControllerMainchainUpg = pendleGaugeControllerMainchainUpg

    const newMessage = {
      pendleGaugeControllerMainchainUpg: pendleGaugeControllerMainchainUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
