import { Address, Hex, keccak256, toHex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { GrantRolePendleGovernanceProxyTxBuilder } from '@actions/subactions/tx-builders/PendleGovernanceProxy/grantRole'

import { PendleRegistry } from '@/src/type'

export type GrantRoleGuardianSubActionParams = {
  pendleGovernanceProxy: Address
  account: Address
}

export type AddGuardianMsg = {}

export class GrantRoleGuardianSubAction extends SubAction<GrantRoleGuardianSubActionParams, PendleRegistry, AddGuardianMsg> {
  constructor(client: InfinitWallet, params: GrantRoleGuardianSubActionParams) {
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
