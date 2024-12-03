import { z } from 'zod'

import { getAddress, zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { SetMaxHealthAfterLiqSubAction, SetMaxHealthAfterLiqSubActionParams } from '@actions/subactions/setMaxHealthAfterLiq'
import {
  SetModeAndTokenLiqMultiplierSubAction,
  SetModeAndTokenLiqMultiplierSubActionParams,
} from '@actions/subactions/setModeAndTokenLiqMultiplier'
import { SetModeDebtCeilingInfosSubAction, SetModeDebtCeilingInfosSubActionParams } from '@actions/subactions/setModeDebtCeilingInfos'
import { SetModePoolFactorsSubAction, SetModePoolFactorsSubActionParams } from '@actions/subactions/setModePoolFactors'
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
      pools: z.array(
        z.object({
          address: zodAddressNonZero.describe(`Pool address, e.g. '0x123...abc`),
          collFactorE18: z.bigint().nonnegative().describe(`Collateral factor in E18, should be less than 1e18, e.g. parseUnit('0.8', 18)`),
          borrFactorE18: z.bigint().nonnegative().describe(`Borrow factor in E18, should be greater than 1e18, e.g. parseUnit('1.1', 18)`),
          debtCeiling: z
            .bigint()
            .nonnegative()
            .describe(
              `Debt ceiling for the pool in this mode, user could no longer borrow from the pool for this mode if the debt ceiling is reached`,
            ),
        }),
      ),
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
    if (!registry.riskManagerProxy) throw new ValidateInputValueError('registry: riskManagerProxy not found')

    // set mode status params (guardian)
    const setModeStatusSubActionParams: SetModeStatusSubActionParams = {
      config: registry.configProxy,
      modeStatus: this.data.params.modes.map((mode) => ({
        mode: mode.mode,
        status: mode.status,
      })),
    }

    // set max health after liq params (guardian)
    const setMaxHealthAfterliqSubActionParams: SetMaxHealthAfterLiqSubActionParams = {
      config: registry.configProxy,
      maxHealthAfterLiqConfigs: this.data.params.modes.map((mode) => {
        return {
          mode: mode.mode,
          maxHealthAfterLiqE18: mode.maxHealthAfterLiqE18,
        }
      }),
    }

    // set mode liquidation params (governor)
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

    // set risk manager mode debt ceiling params (guardian)
    if (!registry.riskManagerProxy) throw new ValidateInputValueError('registry: riskManagerProxy not found')

    const setModeDebtCeilingInfosSubActionParams: SetModeDebtCeilingInfosSubActionParams = {
      riskManager: registry.riskManagerProxy,
      modeDebtCeilingInfos: this.data.params.modes.map((mode) => {
        return {
          mode: mode.mode,
          pools: mode.pools.map((pool) => pool.address),
          ceilAmts: mode.pools.map((pool) => pool.debtCeiling),
        }
      }),
    }

    // set mode pool factor (governor)
    const setModePoolFactorsSubActionParams: SetModePoolFactorsSubActionParams = {
      config: registry.configProxy,
      modePoolFactors: this.data.params.modes.map((mode) => {
        return {
          mode: mode.mode,
          poolFactors: mode.pools
            .map((pool) => {
              return {
                pool: pool.address,
                collFactor_e18: pool.collFactorE18,
                borrFactor_e18: pool.borrFactorE18,
              }
            })
            // sort by pool address from low to high
            .sort((firstItem, secondItem) => (getAddress(firstItem.pool) > getAddress(secondItem.pool) ? 1 : -1)),
        }
      }),
    }

    return [
      new SetModeStatusSubAction(guardian, setModeStatusSubActionParams),
      new SetMaxHealthAfterLiqSubAction(guardian, setMaxHealthAfterliqSubActionParams),
      new SetModeAndTokenLiqMultiplierSubAction(governor, setModeLiqMultiplierSubActionParams),
      new SetModeDebtCeilingInfosSubAction(guardian, setModeDebtCeilingInfosSubActionParams),
      new SetModePoolFactorsSubAction(governor, setModePoolFactorsSubActionParams),
    ]
  }
}
