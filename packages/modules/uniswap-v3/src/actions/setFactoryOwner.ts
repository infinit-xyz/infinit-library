import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetFactoryOwnerSubAction, SetFactoryOwnerSubActionParams } from '@actions/subactions/setFactoryOwner'

import { UniswapV3Registry } from '@/src/type'

export const SetFactoryOwnerActionParamsSchema = z.object({
  uniswapV3Factory: zodAddressNonZero.describe(`Address of the Uniswap V3 factory`),
  newOwner: zodAddressNonZero.describe(`Address of the new owner of the factory`),
}) satisfies z.ZodType<SetFactoryOwnerSubActionParams>

export type SetFactoryOwnerActionParams = z.infer<typeof SetFactoryOwnerActionParamsSchema>

export type SetFactoryOwnerActionData = {
  params: SetFactoryOwnerActionParams
  signer: Record<'factoryOwner', InfinitWallet>
}

export class SetFactoryOwnerAction extends Action<SetFactoryOwnerActionData, UniswapV3Registry> {
  constructor(data: SetFactoryOwnerActionData) {
    validateActionData(data, SetFactoryOwnerActionParamsSchema, ['factoryOwner'])

    super(SetFactoryOwnerAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['factoryOwner']
    const params = this.data.params
    return [new SetFactoryOwnerSubAction(owner, params)]
  }
}