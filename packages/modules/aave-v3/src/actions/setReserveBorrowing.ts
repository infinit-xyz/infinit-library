import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetReserveBorrowingSubAction } from '@actions/subactions/setReserveBorrowingSubAction'

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
})

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

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    if (!registry.poolConfiguratorProxy) {
      throw new ValidateInputValueError('registry: poolConfiguratorProxy not found')
    }

    const poolAdmin = this.data.signer['poolAdmin']
    const params = {
      ...this.data.params,
      aclManager: registry.aclManager,
      poolConfigurator: registry.poolConfiguratorProxy,
    }

    return [new SetReserveBorrowingSubAction(poolAdmin, params)]
  }
}
