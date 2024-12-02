import { z } from 'zod'

import { zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { SetMaxHealthAfterLiqSubAction, SetMaxHealthAfterLiqSubActionParams } from '@actions/subactions/setMaxHealthAfterLiq'
import {
  SetModeAndTokenLiqMultiplierSubAction,
  SetModeAndTokenLiqMultiplierSubActionParams,
} from '@actions/subactions/setModeAndTokenLiqMultiplier'
import { SetModeStatusSubAction, SetModeStatusSubActionParams } from '@actions/subactions/setModeStatus'
import { ModeStatus } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'

export const AddNewModesActionParamsSchema = z.object({
  modes: z.array(
    z.object({
      mode: z.number().describe(`Mode number starting from 0`),
      status: z.object({
        canCollateralize: z.boolean().describe(`Can this mode collateralize`),
        canDecollateralize: z.boolean().describe(`Can this mode decollateralize`),
        canBorrow: z.boolean().describe(`Can this mode borrow`),
        canRepay: z.boolean().describe(`Can this mode repay`),
      }) satisfies z.ZodType<ModeStatus>,
      liqIncentiveMultiplierE18: z.bigint().describe(`Mode liqquidation incentive multiplier in e18, e.g. 8n * (10n ** 16n)[0.8e18]`),
      minLiqIncentiveMultiplierE18: z
        .bigint()
        .describe(`Mode min liquidation incentive multiplier in e18, e.g. 101n * (10n ** 16n)[1.01e18]`),
      maxHealthAfterLiqE18: z.bigint().describe(`Mode max health affter liquidation in e18, e.g. 102n * (10n ** 16n)[1.02e18]`),
    }),
  ),
})

export type AddNewModesActionParams = z.infer<typeof AddNewModesActionParamsSchema>

export type AddNewModesActionData = {
  params: AddNewModesActionParams
  signer: Record<'governor' | 'guardian', InfinitWallet>
}

export class AddNewModesAction extends Action<AddNewModesActionData, InitCapitalRegistry> {
  constructor(data: AddNewModesActionData) {
    validateActionData(data, AddNewModesActionParamsSchema, ['governor', 'guardian'])
    super(AddNewModesAction.name, data)
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
        status: mode.status,
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
      // no need to set token liq incentive multiplier so leave it as zero address and undefined
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
