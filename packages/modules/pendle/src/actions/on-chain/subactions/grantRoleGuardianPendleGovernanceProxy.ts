import { Address, Hex, keccak256, toHex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { GrantRolePendleGovernanceProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleGovernanceProxy/grantRole'

import { PendleV3Registry } from '@/src/type'

export type GrantRoleGuardianPendleGovernanceProxySubActionParams = {
  pendleGovernanceProxy: Address
  account: Address
}

export type GrantRoleGuardianMsg = {}

export class GrantRoleGuardianSubAction extends SubAction<
  GrantRoleGuardianPendleGovernanceProxySubActionParams,
  PendleV3Registry,
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

  public async updateRegistryAndMessage(registry: PendleV3Registry, _txHashes: Hex[]): Promise<SubActionExecuteResponse<PendleV3Registry>> {
    // no new address, do nothing
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
