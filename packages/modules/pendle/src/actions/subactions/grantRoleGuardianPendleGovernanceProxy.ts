import { Address, Hex, keccak256, toHex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { GrantRolePendleGovernanceProxyTxBuilder } from '@actions/subactions/tx-builders/PendleGovernanceProxy/grantRole'

import { PendleRegistry } from '@/src/type'

export type GrantRoleGuardianPendleGovernanceProxySubActionParams = {
  pendleGovernanceProxy: Address
  account: Address
}

export type GrantRoleGuardianMsg = {}

export class GrantRoleGuardianSubAction extends SubAction<
  GrantRoleGuardianPendleGovernanceProxySubActionParams,
  PendleRegistry,
  GrantRoleGuardianMsg
> {
  constructor(client: InfinitWallet, params: GrantRoleGuardianPendleGovernanceProxySubActionParams) {
    super(GrantRoleGuardianSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- grant guardian role -----------
    this.txBuilders.push(
      new GrantRolePendleGovernanceProxyTxBuilder(this.client, {
        pendleGovernanceProxy: this.params.pendleGovernanceProxy,
        role: keccak256(toHex('GUARDIAN')),
        account: this.params.account,
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
