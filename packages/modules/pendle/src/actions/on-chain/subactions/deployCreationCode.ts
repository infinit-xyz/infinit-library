import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  DeployCreationCodeTxBuilder,
  DeployCreationCodeTxBuilderParams,
} from '@actions/subactions/tx-builders/BaseSplitCodeFactoryContract/deployCreationCode'

import { PendleV3Registry } from '@/src/type'

export type DeployCreationCodeSubactionParams = DeployCreationCodeTxBuilderParams

export class DeployCreationCodeSubaction extends SubAction<DeployCreationCodeSubactionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: DeployCreationCodeSubactionParams) {
    super(DeployCreationCodeSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployCreationCodeTxBuilder(this.client, this.params)]
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
