import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { CreateIncentivesSubAction, CreateIncentivesSubActionParams } from '@actions/subactions/createIncentive'

import { UniswapV3Registry } from '@/src/type'

export const CreateIncentivesActionParamsSchema = z.object({
  uniswapV3Staker: zodAddressNonZero.describe('Address of the Uniswap V3 staker contract'),
  incentiveInfos: z
    .array(
      z.object({
        incentiveKey: z
          .object({
            rewardToken: zodAddressNonZero.describe(`Address of the reward token`),
            pool: zodAddressNonZero.describe(`Address of the Uniswap V3 pool`),
            startTime: z.bigint().describe(`Block timestamp when the incentive starts`),
            endTime: z.bigint().describe(`Block timestamp when the incentive ends`),
            refundee: zodAddressNonZero.describe(`Address of the refundee who receives the unclaimed reward token after the end time`),
          })
          .describe(`Incentive key`),
        reward: z.bigint().describe(`Amount of reward token to be distributed`),
      }),
    )
    .describe(`Array of incentive keys and their rewards`),
}) satisfies z.ZodType<CreateIncentivesSubActionParams>

export type CreateIncentivesActionParams = z.infer<typeof CreateIncentivesActionParamsSchema>

export type CreateIncentivesActionData = {
  params: CreateIncentivesActionParams
  signer: Record<'incentiveCreator', InfinitWallet>
}

export class CreateIncentivesAction extends Action<CreateIncentivesActionData, UniswapV3Registry> {
  constructor(data: CreateIncentivesActionData) {
    validateActionData(data, CreateIncentivesActionParamsSchema, ['incentiveCreator'])

    super(CreateIncentivesAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['incentiveCreator']
    const params = this.data.params
    return [new CreateIncentivesSubAction(owner, params)]
  }
}
