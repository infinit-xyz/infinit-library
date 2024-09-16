import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetReserveBorrowingSubAction, SetReserveBorrowingSubActionParams } from '@actions/subactions/setReserveBorrowingSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetReserveBorrowingActionParamsSchema = z.object({
  reserveBorrowingInfos: z
    .array(
      z.object({
        asset: zodAddress,
        enabled: z.boolean(),
      }),
    )
    .describe(`The list of object containing the target asset and enabled status e.g. [{ asset: '0x123...abc', enabled: true }]`),
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetReserveBorrowingSubActionParams>

export type SetReserveBorrowingActionParams = z.infer<typeof SetReserveBorrowingActionParamsSchema>

export type ReserveBorrowingActionData = {
  params: SetReserveBorrowingActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetReserveBorrowingAction extends Action<ReserveBorrowingActionData, AaveV3Registry> {
  constructor(data: ReserveBorrowingActionData) {
    validateActionData(data, SetReserveBorrowingActionParamsSchema, ['poolAdmin'])

    super(SetReserveBorrowingAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params

    return [new SetReserveBorrowingSubAction(poolAdmin, params)]
  }
}
