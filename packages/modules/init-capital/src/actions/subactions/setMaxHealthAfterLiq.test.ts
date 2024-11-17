import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxHealthAfterLiqSubAction, SetMaxHealthAfterLiqSubActionParams } from '@actions/subactions/setMaxHealthAfterLiq'
import { SetMaxHealthAfterLiqE18TxBuilder } from '@actions/subactions/tx-builders/Config/setMaxHealthAfterLiq_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetMaxHealthAfterLiqSubAction extends SetMaxHealthAfterLiqSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxHealthAfterLiqSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetMaxHealthAfterLiqSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      maxHealthAfterLiqConfigs: [
        {
          mode: 1,
          maxHealthAfterLiqE18: parseUnits('1.2', 18),
        },
      ],
    }
    const SetMaxHealthAfterLiqSubAction = new TestSetMaxHealthAfterLiqSubAction(client, params)

    for (let i = 0; i < SetMaxHealthAfterLiqSubAction.txBuilders.length; i++) {
      const txBuilder = SetMaxHealthAfterLiqSubAction.txBuilders[i] as SetMaxHealthAfterLiqE18TxBuilder
      const maxHealthAfterLiqConfigsParams = params.maxHealthAfterLiqConfigs
      expect(txBuilder.mode).toStrictEqual(maxHealthAfterLiqConfigsParams[i].mode)
      expect(txBuilder.maxHealthAfterLiq_e18).toStrictEqual(maxHealthAfterLiqConfigsParams[i].maxHealthAfterLiqE18)
    }
  })
})
