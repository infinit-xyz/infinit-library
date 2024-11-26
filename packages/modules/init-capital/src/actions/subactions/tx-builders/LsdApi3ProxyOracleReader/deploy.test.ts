import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployLsdApi3ProxyOracleReaderTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployLsdApi3ProxyOracleReaderTxBuilder', () => {
  // anvil tester
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let txBuilder: DeployLsdApi3ProxyOracleReaderTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test validate tx builder should be successful.', async () => {
    txBuilder = new DeployLsdApi3ProxyOracleReaderTxBuilder(client, {
      accessControlManager: ARBITRUM_TEST_ADDRESSES.oneAddress,
    })
    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate tx builder zero address should be failed.', async () => {
    txBuilder = new DeployLsdApi3ProxyOracleReaderTxBuilder(client, {
      accessControlManager: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('ACCESS_CONTROL_MANAGER SHOULD_NOT_BE_ZERO_ADDRESS')
  })
})
