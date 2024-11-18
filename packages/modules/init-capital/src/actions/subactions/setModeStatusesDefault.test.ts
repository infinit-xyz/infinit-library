import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetModeStatusesDefaultSubAction, SetModeStatusesDefaultSubActionParams } from '@actions/subactions/setModeStatusesDefault'
import { SetModeStatusTxBuilder } from '@actions/subactions/tx-builders/Config/setModeStatus'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetModeStatusesDefaultSubAction extends SetModeStatusesDefaultSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeStatusesDefaultSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetModeStatusesDefaultSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modeStatuses: [
        {
          mode: 1,
          isNew: true,
        },
        {
          mode: 2,
          isNew: false,
        },
      ],
    }
    const SetModeStatusesDefaultSubAction = new TestSetModeStatusesDefaultSubAction(client, params)

    for (let i = 0; i < SetModeStatusesDefaultSubAction.txBuilders.length; i++) {
      const txBuilder = SetModeStatusesDefaultSubAction.txBuilders[i] as SetModeStatusTxBuilder
      const modeStatuses = params.modeStatuses
      expect(txBuilder.mode).toStrictEqual(modeStatuses[i].mode)
      expect(txBuilder.status.canRepay).toBeTruthy()
      expect(txBuilder.status.canBorrow).toBeTruthy()
      expect(txBuilder.status.canCollateralize).toBeTruthy()
      expect(txBuilder.status.canDecollateralize).toBeTruthy()
    }
  })
})
