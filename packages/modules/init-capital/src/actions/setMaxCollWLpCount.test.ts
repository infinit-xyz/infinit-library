import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetMaxCollWLpCountAction, SetMaxCollWLpCountActionData } from './setMaxCollWLpCount'
import { SetMaxCollWLpCountSubAction } from './subactions/setMaxCollWLpCount'
import { SetMaxCollWLpCountTxBuilder } from './subactions/tx-builders/Config/setMaxCollWLpCount'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetMaxCollWLpCountActionTest extends SetMaxCollWLpCountAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxCollWLpCount', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetMaxCollWLpCountAction.name).toStrictEqual('SetMaxCollWLpCountAction')
  })
  test('test correct calldata', async () => {
    const data: SetMaxCollWLpCountActionData = {
      signer: { guardian: client },
      params: {
        config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        modeMaxCollWLpCount: [
          {
            mode: 1,
            maxCollWLpCount: 5,
          },
          {
            mode: 2,
            maxCollWLpCount: 10,
          },
        ],
      },
    }
    // data.
    const setMaxCollWLpCountAction = new SetMaxCollWLpCountActionTest(data)
    const subActions: SetMaxCollWLpCountSubAction[] = setMaxCollWLpCountAction.getSubActions() as SetMaxCollWLpCountSubAction[]
    expect(subActions[0].params.config).toStrictEqual(data.params.config)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetMaxCollWLpCountTxBuilder
        const mockTxBuilder = data.params.modeMaxCollWLpCount[i]
        expect(txBuilder.mode === mockTxBuilder.mode).toBeTruthy()
        expect(txBuilder.maxCollWLpCount === mockTxBuilder.maxCollWLpCount).toBeTruthy()
      }
    }
  })
})
