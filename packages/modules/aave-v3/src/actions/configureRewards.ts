import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { ApproveSubAction, ApproveSubActionParams } from '@actions/subactions/approve'
import { ConfigureAssetsSubAction } from '@actions/subactions/configureAssets'
import { ConfigureAssetsParams, RewardsConfigInput } from '@actions/subactions/tx-builders/emissionManager/configureAssets'

import type { AaveV3Registry } from '@/src/type'

export const ConfigRewardsParamSchema = z.object({
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

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.emissionManager) {
      throw new ValidateInputValueError('registry: emissionManager not found')
    }
    const emissionAdmin = this.data.signer['emissionAdmin']
    const rewardsHolder = this.data.signer['rewardsHolder']
    const configureAssetsParams: ConfigureAssetsParams = {
      emissionManager: registry.emissionManager,
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
