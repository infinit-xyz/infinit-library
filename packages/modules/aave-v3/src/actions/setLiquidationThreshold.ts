import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  SetLiquidationThresholdSubAction,
  SetLiquidationThresholdSubActionParams,
} from '@actions/subactions/setLiquidationThresholdSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetLiquidationThresholdActionParamsSchema = z.object({
  liquidationThresholdInfos: z
    .array(
      z.object({
        asset: zodAddress,
        liquidationThreshold: z.bigint(),
      }),
    )
    .describe(
      `The list of object containing the target asset and liquidation threshold in bps e.g. [{ asset: '0x123...abc', liquidationThreshold: 100n }]`,
    ),
  pool: zodAddress.describe(`The address of the lending pool contract e.g. '0x123...abc'`),
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
}) satisfies z.ZodType<SetLiquidationThresholdSubActionParams>

export type SetLiquidationThresholdActionParams = z.infer<typeof SetLiquidationThresholdActionParamsSchema>

export type SetLiquidationThresholdActionData = {
  params: SetLiquidationThresholdActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetLiquidationThresholdAction extends Action<SetLiquidationThresholdActionData, AaveV3Registry> {
  constructor(data: SetLiquidationThresholdActionData) {
    validateActionData(data, SetLiquidationThresholdActionParamsSchema, ['poolAdmin'])

    super(SetLiquidationThresholdAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params
    return [new SetLiquidationThresholdSubAction(poolAdmin, params)]
  }
}
