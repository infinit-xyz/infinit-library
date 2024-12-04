import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployPendlePoolDeployHelperTxBuilder } from '@actions/subactions/tx-builders/PendlePoolDeployHelper/deploy'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendlePoolDeployHelperTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: DeployPendlePoolDeployHelperTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new DeployPendlePoolDeployHelperTxBuilder(client, {
      router: '0x0000000000000000000000000000000000000002',
      yieldContractFactory: '0x0000000000000000000000000000000000000003',
      marketFactor: '0x0000000000000000000000000000000000000004',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test tx validate correct address should be pass', async () => {
    txBuilder = new DeployPendlePoolDeployHelperTxBuilder(client, {
      router: '0x0000000000000000000000000000000000000002',
      yieldContractFactory: '0x0000000000000000000000000000000000000003',
      marketFactor: '0x0000000000000000000000000000000000000004',
    })
    expect(txBuilder.validate()).resolves.toBeUndefined()
  })

  test('test tx validate zero address should be reject', async () => {
    txBuilder = new DeployPendlePoolDeployHelperTxBuilder(client, {
      router: zeroAddress,
      yieldContractFactory: '0x0000000000000000000000000000000000000003',
      marketFactor: '0x0000000000000000000000000000000000000004',
    })
    expect(txBuilder.validate()).rejects.toThrowError('Please check your input params\nROUTER SHOULD_NOT_BE_ZERO_ADDRESS')
    txBuilder = new DeployPendlePoolDeployHelperTxBuilder(client, {
      router: '0x0000000000000000000000000000000000000002',
      yieldContractFactory: zeroAddress,
      marketFactor: '0x0000000000000000000000000000000000000004',
    })
    expect(txBuilder.validate()).rejects.toThrowError('Please check your input params\nYIELD_CONTRACT_FACTORY SHOULD_NOT_BE_ZERO_ADDRESS')
    txBuilder = new DeployPendlePoolDeployHelperTxBuilder(client, {
      router: '0x0000000000000000000000000000000000000002',
      yieldContractFactory: '0x0000000000000000000000000000000000000003',
      marketFactor: zeroAddress,
    })
    expect(txBuilder.validate()).rejects.toThrowError('Please check your input params\nMARKET_FACTOR SHOULD_NOT_BE_ZERO_ADDRESS')
  })
})
