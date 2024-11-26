import { z } from 'zod'

import { Action, InfinitWallet } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { CollectProtocolSubAction } from '@actions/subactions/collectProtocol'

import { UniswapV3Registry } from '@/src/type'

export const CollectProtocolActionParamsSchema = z.object({
  pools: z.array(zodAddressNonZero).describe(`Array of pool addresses to collect fees from`),
})

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

  protected getSubActions(registry: UniswapV3Registry) {
    if (!registry['feeVault']) {
      throw new ValidateInputValueError('registry: feeVault not found')
    }
    const owner = this.data.signer['factoryOwner']
    const params = this.data.params
    return [
      new CollectProtocolSubAction(owner, {
        recipient: registry['feeVault'],
        pools: params.pools,
      }),
    ]
  }
}
