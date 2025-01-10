import { beforeAll, describe, expect, test, vi } from 'vitest'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import { CreateNewMarketSubaction } from '@actions/on-chain/subactions/createNewMarket'

import { PendleRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('CreateNewMarketSubaction', () => {
  const registry: PendleRegistry = {}
  let subAction: CreateNewMarketSubaction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<PendleRegistry>
  const callback = vi.fn()

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new CreateNewMarketSubaction(client, {
      pendleMarketFactoryV3: '0x0000000000000000000000000000000000000002',
      PT: '0x0000000000000000000000000000000000000003',
      scalarRoot: 10n,
      initialAnchor: 11n,
      lnFeeRateRoot: 12n,
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('CreateNewMarketSubaction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleMarketFactoryV3: '0x0000000000000000000000000000000000000002',
      PT: '0x0000000000000000000000000000000000000003',
      scalarRoot: 10n,
      initialAnchor: 11n,
      lnFeeRateRoot: 12n,
    })
  })

  test('validate should be success', async () => {
    expect(subAction.params).toStrictEqual({
      pendleMarketFactoryV3: '0x0000000000000000000000000000000000000002',
      PT: '0x0000000000000000000000000000000000000003',
      scalarRoot: 10n,
      initialAnchor: 11n,
      lnFeeRateRoot: 12n,
    })
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })

  test('validate should fail', async () => {
    expect(subAction.params).toStrictEqual({
      pendleMarketFactoryV3: '0x0000000000000000000000000000000000000002',
      PT: '0x0000000000000000000000000000000000000003',
      scalarRoot: 10n,
      initialAnchor: 11n,
      lnFeeRateRoot: 12n,
    })
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {
      throw new Error('validate failed')
    })
    await expect(subAction.validate()).rejects.toThrowError('validate failed')
  })

  test('registry should be empty', async () => {
    result = await subAction.execute(registry, {}, callback)
    // check empty registry
    expect(result.newRegistry).to.toStrictEqual({})
  })

  test('message should be empty', async () => {
    result = await subAction.execute(registry, {}, callback)
    // check empty message
    expect(result.newMessage).to.toStrictEqual({})
  })
})
