import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetLiquidationBonusSubAction, SetLiquidationBonusSubActionParams } from '@actions/subactions/setLiquidationBonusSubAction'

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
  pool: zodAddress.describe(`The address of the lending pool contract e.g. '0x123...abc'`),
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetLiquidationBonusSubActionParams>

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

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params
    return [new SetLiquidationBonusSubAction(poolAdmin, params)]
  }
}
