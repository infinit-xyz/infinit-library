import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  UpgradePendleGaugeControllerMainchainUpgTxBuilder,
  UpgradePendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/upgradeTo'

import { PendleRegistry } from '@/src/type'

export type UpgradePendleGaugeControllerMainchainUpgSubActionParams = UpgradePendleGaugeControllerMainchainUpgTxBuilderParams

export class UpgradePendleGaugeControllerMainchainUpgSubaction extends SubAction<
  UpgradePendleGaugeControllerMainchainUpgSubActionParams,
  PendleRegistry
> {
  constructor(client: InfinitWallet, params: UpgradePendleGaugeControllerMainchainUpgSubActionParams) {
    super(UpgradePendleGaugeControllerMainchainUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new UpgradePendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
