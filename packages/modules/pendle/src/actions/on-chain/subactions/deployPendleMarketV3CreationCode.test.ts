import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  DeployPendleMarketV3CreationCodeSubaction,
  DeployPendleMarketV3CreationCodeSubactionMsg,
} from '@actions/on-chain/subactions/deployPendleMarketV3CreationCode'

import { DeployBaseSplitCodeFactoryContractSubaction } from './deployBaseSplitCodeFactoryContract'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketV3CreationCodeSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployPendleMarketV3CreationCodeSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployPendleMarketV3CreationCodeSubactionMsg>
  let baseSplitContract: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployBaseSplitSubAction = new DeployBaseSplitCodeFactoryContractSubaction(client)
    const deployBaseSplitResult = await deployBaseSplitSubAction.execute(registry, {}, callback)
    baseSplitContract = deployBaseSplitResult.newMessage!.baseSplitCodeFactoryContract
    subAction = new DeployPendleMarketV3CreationCodeSubaction(client, {
      baseSplitCodeFactoryContact: baseSplitContract,
      oracleLib: '0x0000000000000000000000000000000000000003',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployPendleMarketV3CreationCodeSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      baseSplitCodeFactoryContact: baseSplitContract,
      oracleLib: '0x0000000000000000000000000000000000000003',
    })
  })

  test('validate should be success', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate should be failed', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {
      throw new Error('validate failed')
    })
    await expect(subAction.validate()).rejects.toThrowError('validate failed')
  })

  test('registry should be empty', async () => {
    result = await subAction.execute(registry, {}, callback)

    // check not undefined address
    expect(result.newMessage?.pendleMarketV3CreationCodeContractA).not.toBeUndefined()
    expect(result.newMessage?.pendleMarketV3CreationCodeContractB).not.toBeUndefined()
    expect(result.newMessage?.pendleMarketV3CreationCodeSizeA).not.toBeUndefined()
    expect(result.newMessage?.pendleMarketV3CreationCodeSizeB).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleMarketV3CreationCodeContractA = result.newMessage?.pendleMarketV3CreationCodeContractA
    const pendleMarketV3CreationCodeContractB = result.newMessage?.pendleMarketV3CreationCodeContractB
    const pendleMarketV3CreationCodeSizeA = result.newMessage?.pendleMarketV3CreationCodeSizeA
    const pendleMarketV3CreationCodeSizeB = result.newMessage?.pendleMarketV3CreationCodeSizeB

    // check messages
    expect(pendleMarketV3CreationCodeContractA).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeContractB).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeSizeA).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeSizeB).not.toBeUndefined()
  })
})
