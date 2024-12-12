import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetLtvSubAction } from '@actions/subactions/setLtvSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetLtvActionParamsSchema = z.object({
  ltvInfos: z
    .array(
      z.object({
        asset: zodAddress,
        ltv: z.bigint(),
      }),
    )
    .describe(`The list of object containing the target asset and LTV in bps e.g. [{ asset: '0x123...abc', ltv: 100n }]`),
})

export type SetLtvActionParams = z.infer<typeof SetLtvActionParamsSchema>

export type LtvActionData = {
  params: SetLtvActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetLtvAction extends Action<LtvActionData, AaveV3Registry> {
  constructor(data: LtvActionData) {
    validateActionData(data, SetLtvActionParamsSchema, ['poolAdmin'])

    super(SetLtvAction.name, data)
  }

  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    if (!registry.poolConfiguratorProxy) {
      throw new ValidateInputValueError('registry: poolConfiguratorProxy not found')
    }
    if (!registry.poolProxy) {
      throw new ValidateInputValueError('registry: poolProxy not found')
    }
    const poolAdmin = this.data.signer['poolAdmin']
    const params = {
      ...this.data.params,
      pool: registry.poolProxy,
      aclManager: registry.aclManager,
      poolConfigurator: registry.poolConfiguratorProxy,
    }
    return [new SetLtvSubAction(poolAdmin, params)]
  }
}
