import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetLtvSubAction, SetLtvSubActionParams } from '@actions/subactions/setLtvSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetLtvActionParamsSchema = z.object({
  ltvInfos: z
    .array(
      z.object({
        asset: zodAddress,
        ltv: z.bigint(),
      }),
    )
    .describe(`The list of object containing the target asset and LTV in bps e.g. [{ asset: '0x123...abc', ltv: 100n }]`),
  pool: zodAddress.describe(`The address of the lending pool contract e.g. '0x123...abc'`),
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetLtvSubActionParams>

export type SetLtvActionParams = z.infer<typeof SetLtvActionParamsSchema>

export type LtvActionData = {
  params: SetLtvActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetLtvAction extends Action<LtvActionData, AaveV3Registry> {
  constructor(data: LtvActionData) {
    validateActionData(data, SetLtvActionParamsSchema, ['poolAdmin'])

    super(SetLtvAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params
    return [new SetLtvSubAction(poolAdmin, params)]
  }
}
