import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import {
  InitializePendleGovernanceProxyTxBuilder,
  InitializePendleGovernanceProxyTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGovernanceProxy/initialize'

import { PendleRegistry } from '@/src/type'

export type InitializePendleGovernanceProxySubActionParams = InitializePendleGovernanceProxyTxBuilderParams

export type DeployPendleGovernanceProxyImplMsg = {
  pendleGovernanceProxyImpl: Address
}

export class InitializePendleGovernanceProxySubAction extends SubAction<InitializePendleGovernanceProxySubActionParams, PendleRegistry> {
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

  public async updateRegistryAndMessage(registry: PendleRegistry, _txHashes: Hex[]): Promise<SubActionExecuteResponse<PendleRegistry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
