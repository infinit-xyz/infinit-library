import { describe, expect, test, vi } from 'vitest'

import { Address, getAddress, parseUnits, zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployDefaultReserveInterestRateStrategyAction,
  DeployDefaultReserveInterestRateStrategyData,
} from '@actions/deployDefaultReserveInterestRateStrategy'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('deploy default reserve interest rate strategy action', () => {
  const poolAddressesProvider: Address = ARBITRUM_TEST_ADDRESSES.poolAddressProvider

  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const data: DeployDefaultReserveInterestRateStrategyData = {
    params: {
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
      ],
    },
    signer: { deployer: client },
  }

  test('deploy default reserve interest rate action', async () => {
    const action = new DeployDefaultReserveInterestRateStrategyAction(data)
    const registry: AaveV3Registry = {}
    const callback = vi.fn()
    const result: AaveV3Registry = await action.run(registry, undefined, callback)
    const strategies = result.reserveInterestRateStrategies!
    // check if there is address in the registry and it not a zeroAddress
    expect(getAddress(strategies.rateStrategyVolatileOne as Address)).not.to.equal(zeroAddress)
  })
})
