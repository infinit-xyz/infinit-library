import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployCreationCodeSubaction } from '@actions/on-chain/subactions/deployCreationCode'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployCreationCode', () => {
  const registry: PendleRegistry = {}
  let subAction: DeployCreationCodeSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployCreationCodeSubaction(client, {
      baseSplitCodeFactoryContact: zeroAddress,
      contractName: zeroAddress,
      creationCode: '0x1234',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('DeployCreationCodeSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({ baseSplitCodeFactoryContact: zeroAddress, contractName: zeroAddress, creationCode: '0x1234' })
  })

  test('validate should be success', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate should fail', async () => {
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {
      throw new Error('validate failed')
    })
    await expect(subAction.validate()).rejects.toThrowError('validate failed')
  })

  test('registry should not  be empty', async () => {
    result = await subAction.execute(registry, {}, callback)
    const baseSplitCodeFactoryContract = result.newRegistry.baseSplitCodeFactoryContract
    // check empty registry
    expect(baseSplitCodeFactoryContract).not.toStrictEqual(zeroAddress)
  })

  test('message should not be empty', async () => {
    result = await subAction.execute(registry, {}, callback)
    const baseSplitCodeFactoryContract = result.newMessage
    // check empty message
    expect(baseSplitCodeFactoryContract).not.to.equal(zeroAddress)
  })
})
