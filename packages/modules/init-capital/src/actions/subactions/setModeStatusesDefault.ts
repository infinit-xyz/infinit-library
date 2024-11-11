import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import '@actions/subactions/tx-builders/Config/setModeStatus'
import { SetModeStatusTxBuilder, SetModeStatusTxBuilderParams } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'
import { readArtifact } from '@utils/artifact'

export type ModeStatus = {
  mode: number
  isNew: boolean
}

export type SetModeStatusesDefaultSubActionParams = {
  config: Address
  modeStatuses: ModeStatus[]
}

export class SetModeStatusesDefaultSubAction extends SubAction<SetModeStatusesDefaultSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetModeStatusesDefaultSubActionParams) {
    super(SetModeStatusesDefaultSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    for (const modeStatus of this.params.modeStatuses) {
      const txBuilderParams: SetModeStatusTxBuilderParams = {
        config: this.params.config,
        mode: modeStatus.mode,
        status: {
          canCollateralize: true,
          canDecollateralize: true,
          canBorrow: true,
          canRepay: true,
        },
      }
      this.txBuilders.push(new SetModeStatusTxBuilder(this.client, txBuilderParams))
    }
  }
  protected override async internalValidate(_registry?: InitCapitalRegistry): Promise<void> {
    // read artifact
    const configArtifact = await readArtifact('Config')
    // check if mode status has already been set
    for (const modeStatus of this.params.modeStatuses) {
      const currentModeStatus = await this.client.publicClient.readContract({
        address: this.params.config,
        abi: configArtifact.abi,
        functionName: 'getModeStatus',
        args: [modeStatus.mode],
      })
      const isAlreadySet =
        currentModeStatus.canRepay ||
        currentModeStatus.canBorrow ||
        currentModeStatus.canCollateralize ||
        currentModeStatus.canDecollateralize
      if (isAlreadySet && modeStatus.isNew) throw new Error(`Mode ${modeStatus.mode} is already set`)
    }
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
