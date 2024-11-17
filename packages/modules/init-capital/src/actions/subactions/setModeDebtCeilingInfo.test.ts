import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetModeDebtCeilingInfoSubAction, SetModeDebtCeilingInfoSubActionParams } from '@actions/subactions/setModeDebtCeilingInfo'
import { SetModeDebtCeilingInfoTxBuilder } from '@actions/subactions/tx-builders/RiskManager/setModeDebtCeilingInfo'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetMaxHealthAfterLiqSubAction extends SetModeDebtCeilingInfoSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeDebtCeilingInfoSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetModeDebtCeilingInfoSubActionParams = {
      riskManager: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      ceilAmts: [parseUnits('1.2', 18), parseUnits('1.3', 18)],
      pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
    }
    const SetModeDebtCeilingInfoSubAction = new TestSetMaxHealthAfterLiqSubAction(client, params)

    for (let i = 0; i < SetModeDebtCeilingInfoSubAction.txBuilders.length; i++) {
      const txBuilder = SetModeDebtCeilingInfoSubAction.txBuilders[i] as SetModeDebtCeilingInfoTxBuilder
      expect(txBuilder.mode).toStrictEqual(params.mode)
      for (let j = 0; j < txBuilder.pools.length; j++) {
        expect(txBuilder.pools).toStrictEqual(params.pools)
        expect(txBuilder.ceilAmts).toStrictEqual(params.ceilAmts)
      }
    }
  })
})
