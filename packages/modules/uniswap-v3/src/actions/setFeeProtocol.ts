import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetFeeProtocolSubAction, SetFeeProtocolSubActionParams } from '@actions/subactions/setFeeProtocol'

import { UniswapV3Registry } from '@/src/type'

export const SetFeeProtocolActionParamsSchema = z.object({
  uniswapV3Factory: zodAddressNonZero.describe('Address of the Uniswap V3 factory'),
  feeProtocolInfos: z
    .array(
      z
        .object({
          pool: zodAddressNonZero.describe(`Address of the Uniswap v3 pool`),
          feeProtocol0: z.number().describe(`Fee protocol of pool's token0 (e.g. feeProtocol0 = 4 mean fee protocol of token0 is 25%)`),
          feeProtocol1: z.number().describe(`Fee protocol of pool's token1 (e.g. feeProtocol1 = 4 mean fee protocol of token1 is 25%)`),
        })
        .describe(`Pool address and its fee protocols`),
    )
    .describe(`Array of pool addresses and their fee protocols`),
}) satisfies z.ZodType<SetFeeProtocolSubActionParams>

export type SetFeeProtocolActionParams = z.infer<typeof SetFeeProtocolActionParamsSchema>

export type SetFeeProtocolActionData = {
  params: SetFeeProtocolActionParams
  signer: Record<'factoryOwner', InfinitWallet>
}

export class SetFeeProtocolAction extends Action<SetFeeProtocolActionData, UniswapV3Registry> {
  constructor(data: SetFeeProtocolActionData) {
    validateActionData(data, SetFeeProtocolActionParamsSchema, ['factoryOwner'])

    super(SetFeeProtocolAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['factoryOwner']
    const params = this.data.params
    return [new SetFeeProtocolSubAction(owner, params)]
  }
}
