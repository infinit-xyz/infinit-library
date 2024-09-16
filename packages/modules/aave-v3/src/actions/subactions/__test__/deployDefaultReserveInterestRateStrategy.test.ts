import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, parseUnits, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployDefaultReserveInterestRateStrategySubAction,
  DeployDefaultReserveInterestRateStrategySubActionParams,
} from '@actions/subactions/deployDefaultReserveInterestRateStrategy'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployDefaultReserveInterestRateStrategySubAction', () => {
  let subAction: DeployDefaultReserveInterestRateStrategySubAction
  let client: TestInfinitWallet
  const poolAddressesProvider: Address = ARBITRUM_TEST_ADDRESSES.poolAddressProvider

  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const params: DeployDefaultReserveInterestRateStrategySubActionParams = {
    // use configs from https://github.com/aave/aave-v3-deploy/blob/27ccc6d24ef767a2b71946784a843526edbc9618/markets/aave/rateStrategies.ts
    defaultReserveInterestRateStrategyConfigs: [
      {
        name: 'rateStrategyVolatileOne',
        params: {
          poolAddressesProvider: poolAddressesProvider,
          optimalUsageRatio: parseUnits('0.45', 27),
          baseVariableBorrowRate: parseUnits('0', 0),
          variableRateSlope1: parseUnits('0.07', 27),
          variableRateSlope2: parseUnits('3', 27),
          stableRateSlope1: parseUnits('0.07', 27),
          stableRateSlope2: parseUnits('3', 27),
          baseStableRateOffset: parseUnits('0.02', 27),
          stableRateExcessOffset: parseUnits('0.05', 27),
          optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
        },
      },
      {
        name: 'rateStrategyStableOne',
        params: {
          poolAddressesProvider: poolAddressesProvider,
          optimalUsageRatio: parseUnits('0.9', 27),
          baseVariableBorrowRate: parseUnits('0', 27),
          variableRateSlope1: parseUnits('0.04', 27),
          variableRateSlope2: parseUnits('0.6', 27),
          stableRateSlope1: parseUnits('0.005', 27),
          stableRateSlope2: parseUnits('0.6', 27),
          baseStableRateOffset: parseUnits('0.01', 27),
          stableRateExcessOffset: parseUnits('0.08', 27),
          optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
        },
      },
      {
        name: 'rateStrategyStableTwo',
        params: {
          poolAddressesProvider: poolAddressesProvider,
          optimalUsageRatio: parseUnits('0.8', 27),
          baseVariableBorrowRate: parseUnits('0', 27),
          variableRateSlope1: parseUnits('0.04', 27),
          variableRateSlope2: parseUnits('0.75', 27),
          stableRateSlope1: parseUnits('0.005', 27),
          stableRateSlope2: parseUnits('0.75', 27),
          baseStableRateOffset: parseUnits('0.01', 27),
          stableRateExcessOffset: parseUnits('0.08', 27),
          optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
        },
      },
    ],
  }

  beforeAll(() => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
  })

  test('deploy default reserve interest rate startegy', async () => {
    subAction = new DeployDefaultReserveInterestRateStrategySubAction(client, params)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result = await subAction.execute(registry, {}, callback)
    const strategies = result.newRegistry.reserveInterestRateStrategies!

    // check no zero address
    expect(strategies.rateStrategyVolatileOne).not.to.equal(zeroAddress)
    expect(strategies.rateStrategyStableOne).not.to.equal(zeroAddress)
    expect(strategies.rateStrategyStableTwo).not.to.equal(zeroAddress)

    // check unique of the strategy addresses
    const strategiesSize = new Set(Object.values(strategies)).size
    expect(strategiesSize).to.equal(params.defaultReserveInterestRateStrategyConfigs.length)
  })
})
