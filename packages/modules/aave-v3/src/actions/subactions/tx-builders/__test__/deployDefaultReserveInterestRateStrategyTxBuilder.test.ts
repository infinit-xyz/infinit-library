import { beforeAll, describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployDefaultReserveInterestRateStrategyTxBuilder } from '@actions/subactions/tx-builders/defaultReserveInterestRateStrategy/deployDefaultReserveInterestRateStrategy'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY

// NOTE: test with Aave v3 on arbitrum
describe('DeployDefaultInterestRateStrategyTxBuilder', () => {
  let txBuilder: DeployDefaultReserveInterestRateStrategyTxBuilder
  let client: InfinitWallet
  const poolAddressesProvider = ARBITRUM_TEST_ADDRESSES.poolAddressProvider

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('successful validate deploy default reserve interest rate strategy', async () => {
    txBuilder = new DeployDefaultReserveInterestRateStrategyTxBuilder(client, {
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
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('failed validate deploy default reserve interest rate strategy', async () => {
    txBuilder = new DeployDefaultReserveInterestRateStrategyTxBuilder(client, {
      poolAddressesProvider: poolAddressesProvider,
      optimalUsageRatio: parseUnits('0.45', 27),
      baseVariableBorrowRate: parseUnits('0', 0),
      variableRateSlope1: parseUnits('0.07', 27),
      variableRateSlope2: parseUnits('0.01', 27),
      stableRateSlope1: parseUnits('0.07', 27),
      stableRateSlope2: parseUnits('3', 27),
      baseStableRateOffset: parseUnits('0.02', 27),
      stableRateExcessOffset: parseUnits('0.05', 27),
      optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
    })
    await expect(txBuilder.validate()).rejects.toThrowError('VARIABLE_RATE_SLOPE_1_GREATER_THAN_VARIABLE_RATE_SLOPE_2')
  })
})
