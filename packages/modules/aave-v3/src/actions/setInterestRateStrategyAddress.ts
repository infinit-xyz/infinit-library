import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
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
  poolConfigurator: zodAddress.describe(`The address of the pool configurator contract e.g. '0x123...abc'`),
  pool: zodAddress.describe(`The address of the lending pool contract e.g. '0x123...abc'`),
  aclManager: zodAddress.describe(`The address of the ACL manager contract e.g. '0x123...abc'`),
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

  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params
    return [new SetInterestRateStrategyAddressSubAction(poolAdmin, params)]
  }
}
