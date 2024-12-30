import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  UpgradePendleGaugeControllerMainchainUpgTxBuilder,
  UpgradePendleGaugeControllerMainchainUpgTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGaugeControllerMainchainUpg/upgradeTo'

import { PendleV3Registry } from '@/src/type'

export type UpgradePendleGaugeControllerMainchainUpgSubActionParams = UpgradePendleGaugeControllerMainchainUpgTxBuilderParams

export class UpgradePendleGaugeControllerMainchainUpgSubaction extends SubAction<
  UpgradePendleGaugeControllerMainchainUpgSubActionParams,
  PendleV3Registry
> {
  constructor(client: InfinitWallet, params: UpgradePendleGaugeControllerMainchainUpgSubActionParams) {
    super(UpgradePendleGaugeControllerMainchainUpgSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new UpgradePendleGaugeControllerMainchainUpgTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
