import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  SetModeAndTokenLiqMultiplierSubAction,
  SetModeAndTokenLiqMultiplierSubActionParams,
} from '@actions/subactions/setModeAndTokenLiqMultiplier'
import { SetMinLiqIncentiveMultiplierE18TxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setMinLiqIncentiveMultiplier_e18'
import { SetModeLiqIncentiveMultiplierE18TxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setModeLiqIncentiveMultiplier_e18'
import { SetTokenLiqIncentiveMultiplierE18TxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setTokenLiqIncentiveMulitiplier_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeAndTokenLiqMultiplierSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test all params should be correct calldata', async () => {
    const params: SetModeAndTokenLiqMultiplierSubActionParams = {
      liqIncentiveCalculator: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokenLiqIncentiveMultiplierConfig: {
        token: '0x0000000000000000000000000000000000000001',
        multiplier_e18: parseUnits('1.0', 18),
      },
      modeLiqIncentiveMultiplierConfigs: [
        {
          mode: 1,
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.2', 18),
          },
        },
        {
          mode: 2,
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.3', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.4', 18),
          },
        },
      ],
    }
    const setModeAndTokenLiqMultiplierSubAction = new SetModeAndTokenLiqMultiplierSubAction(client, params)
    validateTxBuilders(params, setModeAndTokenLiqMultiplierSubAction)
  })

  test('test missing multiplier should be correct calldata', async () => {
    const params: SetModeAndTokenLiqMultiplierSubActionParams = {
      liqIncentiveCalculator: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokenLiqIncentiveMultiplierConfig: {
        token: '0x0000000000000000000000000000000000000001',
      },
      modeLiqIncentiveMultiplierConfigs: [
        {
          mode: 1,
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.2', 18),
          },
        },
        {
          mode: 2,
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.3', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.4', 18),
          },
        },
      ],
    }
    const setModeAndTokenLiqMultiplierSubAction = new SetModeAndTokenLiqMultiplierSubAction(client, params)
    validateTxBuilders(params, setModeAndTokenLiqMultiplierSubAction)
  })

  test('test missing config should be correct calldata', async () => {
    const params: SetModeAndTokenLiqMultiplierSubActionParams = {
      liqIncentiveCalculator: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokenLiqIncentiveMultiplierConfig: {
        token: '0x0000000000000000000000000000000000000001',
        multiplier_e18: parseUnits('1.0', 18),
      },
      modeLiqIncentiveMultiplierConfigs: [
        {
          mode: 1,
        },
        {
          mode: 2,
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.3', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.4', 18),
          },
        },
      ],
    }
    const setModeAndTokenLiqMultiplierSubAction = new SetModeAndTokenLiqMultiplierSubAction(client, params)
    validateTxBuilders(params, setModeAndTokenLiqMultiplierSubAction)
  })
})

const validateTxBuilders = (
  params: SetModeAndTokenLiqMultiplierSubActionParams,
  setModeAndTokenLiqMultiplierSubAction: SetModeAndTokenLiqMultiplierSubAction,
) => {
  // check token liq
  if (params.tokenLiqIncentiveMultiplierConfig.multiplier_e18) {
    const txBuilder0 = setModeAndTokenLiqMultiplierSubAction.txBuilders.shift() as SetTokenLiqIncentiveMultiplierE18TxBuilder
    expect((txBuilder0.liqIncentiveCalculator = params.liqIncentiveCalculator)).toBeTruthy()
    expect((txBuilder0.tokens[0] = params.tokenLiqIncentiveMultiplierConfig.token)).toBeTruthy()
  }

  const modeLiqIncentiveMultiplierConfigs = params.modeLiqIncentiveMultiplierConfigs
  // check mode liq
  const modeLiqMultipliers = modeLiqIncentiveMultiplierConfigs
    .map((modeLiqConfig) => {
      return modeLiqConfig.config?.liqIncentiveMultiplier_e18
        ? {
            mode: modeLiqConfig.mode,
            modeLiqMultipliers: modeLiqConfig.config?.liqIncentiveMultiplier_e18,
          }
        : undefined
    })
    .filter((modeLiqMultiplier) => modeLiqMultiplier !== undefined)

  const txBuilder1 = setModeAndTokenLiqMultiplierSubAction.txBuilders[0] as SetModeLiqIncentiveMultiplierE18TxBuilder
  expect(txBuilder1.liqIncentiveCalculator).toStrictEqual(params.liqIncentiveCalculator)
  expect(txBuilder1.modes).toStrictEqual(modeLiqMultipliers.map((modeLiqMultiplierConfig) => modeLiqMultiplierConfig.mode))
  expect(txBuilder1.multipliers_e18).toStrictEqual(
    modeLiqMultipliers.map((modeLiqMultiplierConfig) => modeLiqMultiplierConfig.modeLiqMultipliers),
  )

  // check min mode liq
  const minLiqMultipliers = modeLiqIncentiveMultiplierConfigs
    .map((modeLiqConfig) => {
      return modeLiqConfig.config?.minLiqIncentiveMultiplier_e18
        ? {
            mode: modeLiqConfig.mode,
            minLiqIncentiveMulitpliers: modeLiqConfig.config.minLiqIncentiveMultiplier_e18,
          }
        : undefined
    })
    .filter((minLiqMultiplier) => minLiqMultiplier !== undefined)

  const txBuilder2 = setModeAndTokenLiqMultiplierSubAction.txBuilders[1] as SetMinLiqIncentiveMultiplierE18TxBuilder
  expect(txBuilder2.liqIncentiveCalculator).toStrictEqual(params.liqIncentiveCalculator)
  expect(txBuilder2.modes).toStrictEqual(minLiqMultipliers.map((minLiqMultiplierConfig) => minLiqMultiplierConfig.mode))
  expect(txBuilder2.minMultipliers_e18).toStrictEqual(
    minLiqMultipliers.map((minLiqMultiplierConfig) => minLiqMultiplierConfig.minLiqIncentiveMulitpliers),
  )
}
