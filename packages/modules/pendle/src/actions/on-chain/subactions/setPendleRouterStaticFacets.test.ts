import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { SetPendleRouterStaticFacetsSubAction } from './setPendleRouterStaticFacets'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetPendleRouterStaticFacetsSubAction', () => {
  let subAction: SetPendleRouterStaticFacetsSubAction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new SetPendleRouterStaticFacetsSubAction(client, {
      pendleRouterStatic: '0x0000000000000000000000000000000000000002',
      actionStorageStatic: '0x0000000000000000000000000000000000000003',
      actionInfoStatic: '0x0000000000000000000000000000000000000004',
      actionMarketAuxStatic: '0x0000000000000000000000000000000000000005',
      actionMarketCoreStatic: '0x0000000000000000000000000000000000000006',
      actionMintRedeemStatic: '0x0000000000000000000000000000000000000007',
      actionVePendleStatic: '0x0000000000000000000000000000000000000008',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('SetPendleRouterStaticFacetsSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleRouterStatic: '0x0000000000000000000000000000000000000002',
      actionStorageStatic: '0x0000000000000000000000000000000000000003',
      actionInfoStatic: '0x0000000000000000000000000000000000000004',
      actionMarketAuxStatic: '0x0000000000000000000000000000000000000005',
      actionMarketCoreStatic: '0x0000000000000000000000000000000000000006',
      actionMintRedeemStatic: '0x0000000000000000000000000000000000000007',
      actionVePendleStatic: '0x0000000000000000000000000000000000000008',
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
