import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { ApproveSubAction, ApproveSubActionParams } from '@actions/subactions/approve'
import { ConfigureAssetsSubAction } from '@actions/subactions/configureAssets'
import { ConfigureAssetsParams, RewardsConfigInput } from '@actions/subactions/tx-builders/emissionManager/configureAssets'

import type { AaveV3Registry } from '@/src/type'

export const ConfigRewardsParamSchema = z.object({
  emissionManager: zodAddressNonZero.describe(`Address of emission manager e.g. '0x123...abc'`),
  rewardsConfigInputs: z.custom<RewardsConfigInput[]>().describe(`Rewards configuration inputs`),
  approveParams: z.custom<ApproveSubActionParams[]>().describe(`Approve tokens to PullRewardsTransferStrategy`),
})

export type ConfigureRewardsParam = z.infer<typeof ConfigRewardsParamSchema>

export type ConfigureRewardsActionData = {
  params: ConfigureRewardsParam
  signer: Record<'emissionAdmin' | 'rewardsHolder', InfinitWallet>
}

export class ConfigRewardsAction extends Action<ConfigureRewardsActionData, AaveV3Registry> {
  constructor(data: ConfigureRewardsActionData) {
    validateActionData(data, ConfigRewardsParamSchema, ['emissionAdmin', 'rewardsHolder'])
    super(ConfigRewardsAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const emissionAdmin = this.data.signer['emissionAdmin']
    const rewardsHolder = this.data.signer['rewardsHolder']
    const configureAssetsParams: ConfigureAssetsParams = {
      emissionManager: this.data.params.emissionManager,
      rewardsConfigInputs: this.data.params.rewardsConfigInputs,
    }
    const approveParams: ApproveSubActionParams[] = this.data.params.approveParams
    const subActions: SubAction[] = [
      // prerequisit: set emission admins
      // 1. configure assets
      new ConfigureAssetsSubAction(emissionAdmin, configureAssetsParams),
    ]
    // 2. approves
    approveParams.map((param: ApproveSubActionParams) => {
      subActions.push(new ApproveSubAction(rewardsHolder, param))
    })

    return subActions
  }
}
