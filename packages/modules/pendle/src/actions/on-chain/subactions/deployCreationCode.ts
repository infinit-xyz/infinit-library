import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  DeployCreationCodeTxBuilder,
  DeployCreationCodeTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deployCreationCode'

import { PendleRegistry } from '@/src/type'

export type DeployCreationCodeSubactionParams = DeployCreationCodeTxBuilderParams

export class DeployCreationCodeSubaction extends SubAction<DeployCreationCodeSubactionParams, PendleRegistry> {
  constructor(client: InfinitWallet, params: DeployCreationCodeSubactionParams) {
    super(DeployCreationCodeSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployCreationCodeTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
