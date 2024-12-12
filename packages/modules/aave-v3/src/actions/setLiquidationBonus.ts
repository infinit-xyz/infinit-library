import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetLiquidationBonusSubAction } from '@actions/subactions/setLiquidationBonusSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetLiquidationBonusActionParamsSchema = z.object({
  liquidationBonusInfos: z
    .array(
      z.object({
        asset: zodAddress,
        liquidationBonus: z.bigint(),
      }),
    )
    .describe(
      `The list of object containing the target asset and liquidation bonus in bps e.g. [{ asset: '0x123...abc', liquidationBonus: 100n }]`,
    ),
})

export type SetLiquidationBonusActionParams = z.infer<typeof SetLiquidationBonusActionParamsSchema>

export type SetLiquidationBonusActionData = {
  params: SetLiquidationBonusActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetLiquidationBonusAction extends Action<SetLiquidationBonusActionData, AaveV3Registry> {
  constructor(data: SetLiquidationBonusActionData) {
    validateActionData(data, SetLiquidationBonusActionParamsSchema, ['poolAdmin'])

    super(SetLiquidationBonusAction.name, data)
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
    return [new SetLiquidationBonusSubAction(poolAdmin, params)]
  }
}
