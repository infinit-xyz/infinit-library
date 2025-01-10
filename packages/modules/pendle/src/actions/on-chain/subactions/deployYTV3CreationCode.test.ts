import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployYTV3CreationCodeSubaction, DeployYTV3CreationCodeSubactionMsg } from '@actions/on-chain/subactions/deployYTV3CreationCode'

import { DeployBaseSplitCodeFactoryContractSubaction } from './deployBaseSplitCodeFactoryContract'
import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployYTV3CreationCodeSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployYTV3CreationCodeSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry, DeployYTV3CreationCodeSubactionMsg>
  let baseSplitContract: Address
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    const deployBaseSplitSubAction = new DeployBaseSplitCodeFactoryContractSubaction(client)
    const deployBaseSplitResult = await deployBaseSplitSubAction.execute(registry, {}, callback)
    baseSplitContract = deployBaseSplitResult.newMessage!.baseSplitCodeFactoryContract
    subAction = new DeployYTV3CreationCodeSubaction(client, {
      baseSplitCodeFactoryContact: baseSplitContract,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployYTV3CreationCodeSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      baseSplitCodeFactoryContact: baseSplitContract,
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
    expect(result.newMessage?.ytV3CreationCodeContractA).not.toBeUndefined()
    expect(result.newMessage?.ytCreationCodeContractB).not.toBeUndefined()
    expect(result.newMessage?.ytV3CreationCodeContractSizeA).not.toBeUndefined()
    expect(result.newMessage?.ytCreationCodeContractB).not.toBeUndefined()
  })

  test('message should not be zero address', async () => {
    result = await subAction.execute(registry, {}, callback)
    const pendleMarketV3CreationCodeContractA = result.newMessage?.ytV3CreationCodeContractA
    const pendleMarketV3CreationCodeContractB = result.newMessage?.ytCreationCodeContractB
    const pendleMarketV3CreationCodeSizeA = result.newMessage?.ytV3CreationCodeContractSizeA
    const pendleMarketV3CreationCodeSizeB = result.newMessage?.ytCreationCodeContractB

    // check messages
    expect(pendleMarketV3CreationCodeContractA).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeContractB).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeSizeA).not.toBeUndefined()
    expect(pendleMarketV3CreationCodeSizeB).not.toBeUndefined()
  })
})
