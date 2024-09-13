import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { EnableFeeAmountsSubAction, EnableFeeAmountsSubActionParams } from '@actions/subactions/enableFeeAmounts'

import { UniswapV3Registry } from '../type'

export const EnableFeeAmountsActionParamsSchema = z.object({
  uniswapV3Factory: zodAddressNonZero.describe('Address of the Uniswap V3 factory'),
  feeAmounts: z
    .array(
      z.object({
        fee: z.number().describe(`Swap fee in hundredths of a bip (1e-6) (e.g., 3000 for 0.3%)`),
        tickSpacing: z.number().describe(`Tick spacing of the pool`),
      }),
    )
    .describe(`Array of fee amounts and their tick spacings`),
}) satisfies z.ZodType<EnableFeeAmountsSubActionParams>

export type EnableFeeAmountsActionParams = z.infer<typeof EnableFeeAmountsActionParamsSchema>

export type EnableFeeAmountsActionData = {
  params: EnableFeeAmountsActionParams
  signer: Record<'factoryOwner', InfinitWallet>
}

export class EnableFeeAmountsAction extends Action<EnableFeeAmountsActionData, UniswapV3Registry> {
  constructor(data: EnableFeeAmountsActionData) {
    validateActionData(data, EnableFeeAmountsActionParamsSchema, ['factoryOwner'])

    super(EnableFeeAmountsAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['factoryOwner']
    const params = this.data.params
    return [new EnableFeeAmountsSubAction(owner, params)]
  }
}
