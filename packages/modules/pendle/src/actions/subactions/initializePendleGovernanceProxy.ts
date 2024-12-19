import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleGovernanceProxyTxBuilder,
  InitializePendleGovernanceProxyTxBuilderParams,
} from '@actions/subactions/tx-builders/PendleGovernanceProxy/initialize'

import { PendleV3Registry } from '@/src/type'

export type InitializePendleGovernanceProxySubActionParams = InitializePendleGovernanceProxyTxBuilderParams

export type DeployPendleGovernanceProxyImplMsg = {
  pendleGovernanceProxyImpl: Address
}

export class InitializePendleGovernanceProxySubAction extends SubAction<InitializePendleGovernanceProxySubActionParams, PendleV3Registry> {
  constructor(client: InfinitWallet, params: InitializePendleGovernanceProxySubActionParams) {
    super(InitializePendleGovernanceProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- initialize pendle governance proxy -----------
    this.txBuilders.push(
      new InitializePendleGovernanceProxyTxBuilder(this.client, {
        pendleGovernanceProxy: this.params.pendleGovernanceProxy,
        governance: this.params.governance,
      }),
    )
  }

  public async updateRegistryAndMessage(registry: PendleV3Registry, _txHashes: Hex[]): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
