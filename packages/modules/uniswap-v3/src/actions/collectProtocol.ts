import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { CollectProtocolSubAction, CollectProtocolSubActionParams } from '@actions/subactions/collectProtocol'

import { UniswapV3Registry } from '@/src/type'

export const CollectProtocolActionParamsSchema = z.object({
  recipient: zodAddressNonZero.describe(`The recipient's address for the collected fees`),
  pools: z.array(zodAddressNonZero).describe(`Array of pool addresses to collect fees from`),
}) satisfies z.ZodType<CollectProtocolSubActionParams>

export type CollectProtocolActionParams = z.infer<typeof CollectProtocolActionParamsSchema>

export type CollectProtocolActionData = {
  params: CollectProtocolActionParams
  signer: Record<'factoryOwner', InfinitWallet>
}

export class CollectProtocolAction extends Action<CollectProtocolActionData, UniswapV3Registry> {
  constructor(data: CollectProtocolActionData) {
    validateActionData(data, CollectProtocolActionParamsSchema, ['factoryOwner'])

    super(CollectProtocolAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['factoryOwner']
    const params = this.data.params
    return [new CollectProtocolSubAction(owner, params)]
  }
}
