import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxCollWLpCountSubAction, SetMaxCollWLpCountSubActionParams } from '@actions/subactions/setMaxCollWLpCount'

import { SetMaxCollWLpCountTxBuilder } from './tx-builders/Config/setMaxCollWLpCount'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetMaxCollWLpCountSubAction extends SetMaxCollWLpCountSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

// TODO update config to use the address from base init capital test setup
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const registry: InitCapitalRegistry = {}
  test('test correct name', async () => {
    expect(SetMaxCollWLpCountSubAction.name).toStrictEqual('SetMaxCollWLpCountSubAction')
  })

  test('test correct calldata', async () => {
    const params: SetMaxCollWLpCountSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modeMaxCollWLpCount: [
        { mode: 1, maxCollWLpCount: 5 },
        { mode: 2, maxCollWLpCount: 10 },
      ],
    }
    const setPoolConfigSubAction = new TestSetMaxCollWLpCountSubAction(client, params)

    for (let i = 0; i < setPoolConfigSubAction.txBuilders.length; i++) {
      const txBuilder = setPoolConfigSubAction.txBuilders[i] as SetMaxCollWLpCountTxBuilder
      const mockTxBuilder = params.modeMaxCollWLpCount[i]
      expect(txBuilder.mode === mockTxBuilder.mode).toBeTruthy()
      expect(txBuilder.maxCollWLpCount === mockTxBuilder.maxCollWLpCount).toBeTruthy()
    }
  })

  test('test update registry and message', async () => {
    const params: SetMaxCollWLpCountSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modeMaxCollWLpCount: [
        { mode: 1, maxCollWLpCount: 5 },
        { mode: 2, maxCollWLpCount: 10 },
      ],
    }

    const subAction = new TestSetMaxCollWLpCountSubAction(client, params)

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})
  })
})
