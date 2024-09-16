import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetReservePauseSubAction, SetReservePauseSubActionParams } from '@actions/subactions/setReservePauseSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetReservePauseActionParamsSchema = z.object({
  reservePauseInfos: z
    .array(
      z.object({
        asset: zodAddress,
        paused: z.boolean(),
      }),
    )
    .describe(`The list of object containing the target asset and paused status e.g. [{ asset: '0x123...abc', paused: true }]`),
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetReservePauseSubActionParams>

export type SetReservePauseActionParams = z.infer<typeof SetReservePauseActionParamsSchema>

export type ReservePauseActionData = {
  params: SetReservePauseActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetReservePauseAction extends Action<ReservePauseActionData, AaveV3Registry> {
  constructor(data: ReservePauseActionData) {
    validateActionData(data, SetReservePauseActionParamsSchema, ['poolAdmin'])

    super(SetReservePauseAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params
    return [new SetReservePauseSubAction(poolAdmin, params)]
  }
}
