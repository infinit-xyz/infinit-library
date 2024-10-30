import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetLiqIncentiveCalculatorSubAction } from '@actions/subactions/setLiqIncentiveCalculator'
import {
  SetLiqIncentiveCalculatorTxBuilder,
  SetLiqIncentiveCalculatorTxBuilderParams,
} from '@actions/subactions/tx-builders/InitCore/setLiqIncentiveCalculator'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/Test'

class SestsetLiqIncentiveCalculatorSubAction extends SetLiqIncentiveCalculatorSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetLiqIncentiveCalculatorSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct sub actions params', async () => {
    const params: SetLiqIncentiveCalculatorTxBuilderParams = {
      initCore: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      liqIncentiveCalculator: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
    }
    const SetLiqIncentiveCalculatorSubAction = new SestsetLiqIncentiveCalculatorSubAction(client, params)
    const txBuilders = SetLiqIncentiveCalculatorSubAction.txBuilders
    const txBuilder: SetLiqIncentiveCalculatorTxBuilder = txBuilders[0] as SetLiqIncentiveCalculatorTxBuilder
    expect(txBuilders.length).toStrictEqual(1)
    expect(txBuilder.initCore).toStrictEqual(params.initCore)
    expect(txBuilder.liqIncentiveCalculator).toStrictEqual(params.liqIncentiveCalculator)
  })
})
