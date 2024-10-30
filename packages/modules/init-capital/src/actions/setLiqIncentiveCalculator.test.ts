import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetLiqIncentiveCalculatorAction, SetLiqIncentiveCalculatorActionData } from '@actions/setLiqIncentiveCalculator'
import { SetLiqIncentiveCalculatorTxBuilder } from '@actions/subactions/tx-builders/InitCore/setLiqIncentiveCalculator'

import { SetLiqIncentiveCalculatorSubAction } from './subactions/setLiqIncentiveCalculator'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetLiqIncentiveCalculatorActionTest extends SetLiqIncentiveCalculatorAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetLiqIncentiveCalculator', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetLiqIncentiveCalculatorAction.name).toStrictEqual('SetLiqIncentiveCalculatorAction')
  })
  test('test correct calldata', async () => {
    const data: SetLiqIncentiveCalculatorActionData = {
      signer: { guardian: client },
      params: {
        initCore: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        liqIncentiveCalculator: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      },
    }
    // data.
    const SetLiqIncentiveCalculatorAction = new SetLiqIncentiveCalculatorActionTest(data)
    const subActions: SetLiqIncentiveCalculatorSubAction[] =
      SetLiqIncentiveCalculatorAction.getSubActions() as SetLiqIncentiveCalculatorSubAction[]
    expect(subActions[0].params.initCore).toStrictEqual(data.params.initCore)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetLiqIncentiveCalculatorTxBuilder
        expect(txBuilder.initCore === data.params.initCore).toBeTruthy()
        expect(txBuilder.liqIncentiveCalculator === data.params.liqIncentiveCalculator).toBeTruthy()
      }
    }
  })
})
