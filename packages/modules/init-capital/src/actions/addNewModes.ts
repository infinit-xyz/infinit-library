import { z } from 'zod'

import { zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { SetMaxHealthAfterLiqSubAction, SetMaxHealthAfterLiqSubActionParams } from '@actions/subactions/setMaxHealthAfterLiq'

import {
  SetModeAndTokenLiqMultiplierSubAction,
  SetModeAndTokenLiqMultiplierSubActionParams,
} from './subactions/setModeAndTokenLiqMultiplier'
import { SetModeStatusSubAction, SetModeStatusSubActionParams } from './subactions/setModeStatus'
import { ModeStatus } from './subactions/tx-builders/Config/setModeStatus'
import { InitCapitalRegistry } from '@/src/type'

export const AddNewModesActionParamsSchema = z.object({
  modes: z.array(
    z.object({
      mode: z.number(),
      modeStatus: z.object({
        canCollateralize: z.boolean(),
        canDecollateralize: z.boolean(),
        canBorrow: z.boolean(),
        canRepay: z.boolean(),
      }) satisfies z.ZodType<ModeStatus>,
      liqIncentiveMultiplierE18: z.bigint(),
      minLiqIncentiveMultiplierE18: z.bigint(),
      maxHealthAfterLiqE18: z.bigint(),
    }),
  ),
})

export type AddNewModesActionParams = z.infer<typeof AddNewModesActionParamsSchema>

export type AddNewModeActionData = {
  params: AddNewModesActionParams
  signer: Record<'governor' | 'guardian', InfinitWallet>
}

export class AddNewModeAction extends Action<AddNewModeActionData, InitCapitalRegistry> {
  constructor(data: AddNewModeActionData) {
    validateActionData(data, AddNewModesActionParamsSchema, ['governor'])
    super(AddNewModeAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']
    const guardian = this.data.signer['guardian']

    // validate registry
    if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')
    if (!registry.liqIncentiveCalculatorProxy) throw new ValidateInputValueError('registry: liqIncentiveCalculatorProxy not found')

    // set mode status params
    const setModeStatusSubActionParams: SetModeStatusSubActionParams = {
      config: registry.configProxy,
      modeStatus: this.data.params.modes.map((mode) => ({
        mode: mode.mode,
        status: mode.modeStatus,
      })),
    }

    // set max health after liq params
    const setMaxHealthAfterliqSubActionParams: SetMaxHealthAfterLiqSubActionParams = {
      config: registry.configProxy,
      maxHealthAfterLiqConfigs: this.data.params.modes.map((mode) => {
        return {
          mode: mode.mode,
          maxHealthAfterLiqE18: mode.maxHealthAfterLiqE18,
        }
      }),
    }

    // set mode liquidation params
    const setModeLiqMultiplierSubActionParams: SetModeAndTokenLiqMultiplierSubActionParams = {
      liqIncentiveCalculator: registry.liqIncentiveCalculatorProxy,
      tokenLiqIncentiveMultiplierConfig: {
        token: zeroAddress,
        multiplier_e18: undefined,
      },
      modeLiqIncentiveMultiplierConfigs: this.data.params.modes.map((mode) => {
        return {
          mode: mode.mode,
          config: {
            liqIncentiveMultiplier_e18: mode.liqIncentiveMultiplierE18,
            minLiqIncentiveMultiplier_e18: mode.minLiqIncentiveMultiplierE18,
          },
        }
      }),
    }

    return [
      new SetModeStatusSubAction(guardian, setModeStatusSubActionParams),
      new SetMaxHealthAfterLiqSubAction(guardian, setMaxHealthAfterliqSubActionParams),
      new SetModeAndTokenLiqMultiplierSubAction(governor, setModeLiqMultiplierSubActionParams),
    ]
  }
}
