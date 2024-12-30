import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleGaugeControllerMainchainUpgTxBuilder,
  DeployPendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleGaugeControllerMainchainUpgSubactionParams = DeployPendleGaugeControllerMainchainUpgTxBuilderParams

export type DeployPendleGaugeControllerMainchainUpgSubactionMsg = {
  pendleGaugeControllerMainchainUpgImpl: Address
}
export class DeployPendleGaugeControllerMainchainUpgSubaction extends SubAction<
  DeployPendleGaugeControllerMainchainUpgSubactionParams,
  PendleRegistry,
  DeployPendleGaugeControllerMainchainUpgSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(DeployPendleGaugeControllerMainchainUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleGaugeControllerMainchainUpgSubactionMsg>> {
    const [deployPendleGaugeControllerMainchainUpgTxHash] = txHashes
    const { contractAddress: pendleGaugeControllerMainchainUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleGaugeControllerMainchainUpgTxHash,
    })
    if (!pendleGaugeControllerMainchainUpg) {
      throw new ContractNotFoundError(deployPendleGaugeControllerMainchainUpgTxHash, 'PendleGaugeControllerMainchainUpg')
    }
    registry.pendleGaugeControllerMainchainUpgImpl = pendleGaugeControllerMainchainUpg

    const newMessage = {
      pendleGaugeControllerMainchainUpgImpl: pendleGaugeControllerMainchainUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
