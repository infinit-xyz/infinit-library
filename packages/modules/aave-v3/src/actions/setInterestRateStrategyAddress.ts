import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetInterestRateStrategyAddressSubAction } from '@actions/subactions/setReserveInterestRateStrategyAddressSubAction'

import { AaveV3Registry } from '@/src/type'

export const SetInterestRateStrategyAddressActionParamsSchema = z.object({
  interestRateStrategyAddressInfos: z
    .array(
      z.object({
        asset: zodAddress,
        interestRateStrategy: zodAddress,
      }),
    )
    .describe(`The address of the interest rate strategy contract e.g. '0x123...abc'`),
})

export type SetInterestRateStrategyAddressActionParams = z.infer<typeof SetInterestRateStrategyAddressActionParamsSchema>

export type SetInterestRateStrategyAddressActionData = {
  params: SetInterestRateStrategyAddressActionParams
  signer: Record<'poolAdmin', InfinitWallet>
}

export class SetInterestRateStrategyAddressAction extends Action<SetInterestRateStrategyAddressActionData, AaveV3Registry> {
  constructor(data: SetInterestRateStrategyAddressActionData) {
    validateActionData(data, SetInterestRateStrategyAddressActionParamsSchema, ['poolAdmin'])
    super(SetInterestRateStrategyAddressAction.name, data)
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
    return [new SetInterestRateStrategyAddressSubAction(poolAdmin, params)]
  }
}
