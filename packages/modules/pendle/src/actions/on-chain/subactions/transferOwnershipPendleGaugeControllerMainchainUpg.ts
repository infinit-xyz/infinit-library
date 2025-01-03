import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder,
  TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/transferOwnership'

import { PendleRegistry } from '@/src/type'

export type TransferOwnershipPendleGaugeControllerMainchainUpgSubActionParams =
  TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilderParams

export class TransferOwnershipPendleGaugeControllerMainchainUpgSubAction extends SubAction<
  TransferOwnershipPendleGaugeControllerMainchainUpgSubActionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: TransferOwnershipPendleGaugeControllerMainchainUpgSubActionParams) {
    super(TransferOwnershipPendleGaugeControllerMainchainUpgSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new TransferOwnershipPendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
