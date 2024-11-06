import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { MintInfinitERC20SubAction, MintInfinitERC20SubActionParams } from '@actions/on-chain/subactions/mintInfinitERC20'

import { TokenRegistry } from '@/src/type'

export const MintInfinitERC20ActionParamsSchema = z.object({
  token: zodAddressNonZero.describe(`token to mint`),
  receivers: z.array(zodAddressNonZero.describe(`token receiver`)),
  amounts: z.array(z.bigint().describe(`mint amount`)),
})

export type MintInfinitERC20ActionParams = z.infer<typeof MintInfinitERC20ActionParamsSchema>

export type MintInfinitERC20ActionData = {
  params: MintInfinitERC20ActionParams
  signer: Record<'owner', InfinitWallet>
}

export class MintInfinitERC20Action extends Action<MintInfinitERC20ActionData, TokenRegistry> {
  constructor(data: MintInfinitERC20ActionData) {
    validateActionData(data, MintInfinitERC20ActionParamsSchema, ['owner'])
    super(MintInfinitERC20Action.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['owner']
    const params = this.data.params
    const MintInfinitERC20Params: MintInfinitERC20SubActionParams = {
      token: params.token,
      receivers: params.receivers,
      amounts: params.amounts,
    }
    return [new MintInfinitERC20SubAction(owner, MintInfinitERC20Params)]
  }
}
