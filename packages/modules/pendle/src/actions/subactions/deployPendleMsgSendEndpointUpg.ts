import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployPendleMsgSendEndpointUpgTxBuilder,
  DeployPendleMsgSendEndpointUpgTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleMsgSendEndpointUpg/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployPendleMsgSendEndpointUpgSubactionParams = DeployPendleMsgSendEndpointUpgTxBuilderParams

export type DeployPendleMsgSendEndpointUpgSubactionMsg = {
  pendleMsgSendEndpointUpg: Address
}

export class DeployPendleMsgSendEndpointUpgSubaction extends SubAction<DeployPendleMsgSendEndpointUpgSubactionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: DeployPendleMsgSendEndpointUpgSubactionParams) {
    super(DeployPendleMsgSendEndpointUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleMsgSendEndpointUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    const [deployPendleSwapTxHash] = txHashes
    const { contractAddress: pendleMsgSendEndpointUpg } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleSwapTxHash,
    })
    if (!pendleMsgSendEndpointUpg) {
      throw new ContractNotFoundError(deployPendleSwapTxHash, 'PendleSwap')
    }
    registry.pendleMsgSendEndpointUpgImpl = pendleMsgSendEndpointUpg

    const newMessage = {
      pendleMsgSendEndpointUpg: pendleMsgSendEndpointUpg,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
