import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetModeDebtCeilingInfosSubAction, SetModeDebtCeilingInfosSubActionParams } from '@actions/subactions/setModeDebtCeilingInfos'
import { SetModeDebtCeilingInfoTxBuilder } from '@actions/subactions/tx-builders/RiskManager/setModeDebtCeilingInfo'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetModeDebtCeilingInfosSubAction extends SetModeDebtCeilingInfosSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeDebtCeilingInfosSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetModeDebtCeilingInfosSubActionParams = {
      riskManager: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modeDebtCeilingInfos: [
        {
          mode: 1,
          ceilAmts: [parseUnits('1.2', 18), parseUnits('1.3', 18)],
          pools: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
        },
        {
          mode: 2,
          ceilAmts: [parseUnits('1.3', 18), parseUnits('1.4', 18)],
          pools: ['0x0000000000000000000000000000000000000002', '0x0000000000000000000000000000000000000003'],
        },
      ],
    }
    const SetModeDebtCeilingInfosSubAction = new TestSetModeDebtCeilingInfosSubAction(client, params)

    for (let i = 0; i < SetModeDebtCeilingInfosSubAction.txBuilders.length; i++) {
      const txBuilder = SetModeDebtCeilingInfosSubAction.txBuilders[i] as SetModeDebtCeilingInfoTxBuilder
      const modeDebtCeilingInfos = params.modeDebtCeilingInfos
      expect(txBuilder.mode).toStrictEqual(modeDebtCeilingInfos[i].mode)
      for (let j = 0; j < modeDebtCeilingInfos[i].pools.length; j++) {
        expect(txBuilder.pools[j]).toStrictEqual(modeDebtCeilingInfos[i].pools[j])
        expect(txBuilder.ceilAmts[j]).toStrictEqual(modeDebtCeilingInfos[i].ceilAmts[j])
      }
    }
  })
})
