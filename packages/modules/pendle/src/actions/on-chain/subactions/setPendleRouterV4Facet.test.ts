import { beforeAll, describe, expect, test, vi } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { SetPendleRouterV4FacetsSubAction } from './setPendleRouterV4Facets'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('SetPendleRouterV4FacetsSubAction', () => {
  let subAction: SetPendleRouterV4FacetsSubAction
  let client: TestInfinitWallet

  const tester = ARBITRUM_TEST_ADDRESSES.tester

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new SetPendleRouterV4FacetsSubAction(client, {
      pendleRouterV4: '0x0000000000000000000000000000000000000002',
      actionStorageV4: '0x0000000000000000000000000000000000000003',
      actionAddRemoveLiqV3: '0x0000000000000000000000000000000000000004',
      actionCallbackV3: '0x0000000000000000000000000000000000000005',
      actionMiscV3: '0x0000000000000000000000000000000000000006',
      actionSimple: '0x0000000000000000000000000000000000000007',
      actionSwapPTV3: '0x0000000000000000000000000000000000000008',
      actionSwapYTV3: '0x0000000000000000000000000000000000000009',
    })
  })

  test('test correct name', async () => {
    expect(subAction.name).toStrictEqual('SetPendleRouterV4FacetsSubAction')
  })

  test('test correct calldata', async () => {
    expect(subAction.params).toStrictEqual({
      pendleRouterV4: '0x0000000000000000000000000000000000000002',
      actionStorageV4: '0x0000000000000000000000000000000000000003',
      actionAddRemoveLiqV3: '0x0000000000000000000000000000000000000004',
      actionCallbackV3: '0x0000000000000000000000000000000000000005',
      actionMiscV3: '0x0000000000000000000000000000000000000006',
      actionSimple: '0x0000000000000000000000000000000000000007',
      actionSwapPTV3: '0x0000000000000000000000000000000000000008',
      actionSwapYTV3: '0x0000000000000000000000000000000000000009',
    })
  })

  test('validate should be success', async () => {
    // spy on validate
    vi.spyOn(subAction.txBuilders[0], 'validate').mockImplementation(async () => {})
    await expect(subAction.validate()).resolves.not.toThrowError()
  })
})
