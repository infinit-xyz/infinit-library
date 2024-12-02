import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetLiquidationThresholdSubAction } from '@actions/subactions/setLiquidationThresholdSubAction'

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
})

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
    return [new SetLiquidationThresholdSubAction(poolAdmin, params)]
  }
}
