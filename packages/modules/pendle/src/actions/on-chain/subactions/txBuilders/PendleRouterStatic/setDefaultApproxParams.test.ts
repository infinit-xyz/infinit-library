// check that all selector is in txData
import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { SetDefaultApproxParamsTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/setDefaultApproxParams'

import { ApproxParams, SetDefaultApproxParamsTxBuilderParams } from './setDefaultApproxParams'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

// anvil tester pk
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('SetDefaultApproxParamsTxBuilder', () => {
  let txBuilder: SetDefaultApproxParamsTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('SetDefaultApproxParamsTxBuilder', async () => {
    // Define the parameters for the transaction builder
    const approxParams: ApproxParams = {
      guessMin: 1000000n,
      guessMax: 100000000n,
      guessOffchain: 10000n,
      maxIteration: 100n,
      eps: 1000n,
    }
    const params: SetDefaultApproxParamsTxBuilderParams = {
      pendleRouterStatic: '0x0000000000000000000000000000000000000B0b',
      approxParams: approxParams,
    }

    // Initialize the transaction builder with the client and parameters
    txBuilder = new SetDefaultApproxParamsTxBuilder(client, params)

    // Build the transaction
    const tx = await txBuilder.buildTx()

    // Check that the transaction recipient is the pendleRouter address
    expect(tx.to).toBe(params.pendleRouterStatic)

    // Ensure the transaction data is defined
    expect(tx.data).toBeDefined()
  })

  test('SetDefaultApproxParamsTxBuilder validate', async () => {
    // Define the parameters for the transaction builder
    const approxParams: ApproxParams = {
      guessMin: 1000000n,
      guessMax: 100000000n,
      guessOffchain: 10000n,
      maxIteration: 100n,
      eps: 1000n,
    }
    const params: SetDefaultApproxParamsTxBuilderParams = {
      pendleRouterStatic: '0x0000000000000000000000000000000000000B0b',
      approxParams: approxParams,
    }

    // Initialize the transaction builder with the client and parameters
    txBuilder = new SetDefaultApproxParamsTxBuilder(client, params)

    // Validate the transaction
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('SetDefaultApproxParamsTxBuilder validate fail', async () => {
    // Define the parameters for the transaction builder
    const approxParams: ApproxParams = {
      guessMin: 1000000n,
      guessMax: 100000000n,
      guessOffchain: 10000n,
      maxIteration: 100n,
      eps: 1000n,
    }
    const params: SetDefaultApproxParamsTxBuilderParams = {
      pendleRouterStatic: zeroAddress,
      approxParams: approxParams,
    }

    // Initialize the transaction builder with the client and parameters
    txBuilder = new SetDefaultApproxParamsTxBuilder(client, params)

    // Validate the transaction
    expect(txBuilder.validate()).rejects.toThrowError('PendleRouterStatic')
  })
})
