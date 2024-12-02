import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetReservePauseSubAction } from '@actions/subactions/setReservePauseSubAction'

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
})

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
    return [new SetReservePauseSubAction(poolAdmin, params)]
  }
}
