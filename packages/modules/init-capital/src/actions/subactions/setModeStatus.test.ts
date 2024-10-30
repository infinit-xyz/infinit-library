import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetModeStatusSubAction, SetModeStatusSubActionParams } from '@actions/subactions/setModeStatus'

import { ModeStatus, SetModeStatusTxBuilder } from './tx-builders/Config/setModeStatus'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetModeStatusSubAction extends SetModeStatusSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetModeStatusSubAction.name).toStrictEqual('SetModeStatusSubAction')
  })

  test('test correct calldata', async () => {
    const params: SetModeStatusSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modeStatus: [
        { mode: 1, status: { canCollateralize: true, canDecollateralize: false, canBorrow: true, canRepay: false } },
        { mode: 2, status: { canCollateralize: false, canDecollateralize: false, canBorrow: false, canRepay: false } },
      ],
    }
    const setPoolConfigSubAction = new TestSetModeStatusSubAction(client, params)

    for (let i = 0; i < setPoolConfigSubAction.txBuilders.length; i++) {
      const txBuilder = setPoolConfigSubAction.txBuilders[i] as SetModeStatusTxBuilder
      const mockTxBuilder = params.modeStatus[i]
      expect(txBuilder.mode === mockTxBuilder.mode).toBeTruthy()

      Object.keys(txBuilder.status).forEach((key) => {
        const poolConfigKey = key as keyof ModeStatus
        expect(txBuilder.status[poolConfigKey] === mockTxBuilder.status[poolConfigKey]).toBeTruthy()
      })
    }
  })
})
