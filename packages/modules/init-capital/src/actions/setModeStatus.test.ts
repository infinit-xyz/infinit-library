import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetModeStatusAction, SetModeStatusActionData } from './setModeStatus'
import { SetModeStatusSubAction } from './subactions/setModeStatus'
import { ModeStatus, SetModeStatusTxBuilder } from './subactions/tx-builders/Config/setModeStatus'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetModeStatusActionTest extends SetModeStatusAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeStatus', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetModeStatusAction.name).toStrictEqual('SetModeStatusAction')
  })
  test('test correct calldata', async () => {
    const data: SetModeStatusActionData = {
      signer: { guardian: client },
      params: {
        config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        modeStatuses: [
          { mode: 1, status: { canCollateralize: true, canDecollateralize: false, canBorrow: true, canRepay: false } },
          { mode: 2, status: { canCollateralize: false, canDecollateralize: false, canBorrow: false, canRepay: false } },
        ],
      },
    }
    // data.
    const SetModeStatusAction = new SetModeStatusActionTest(data)
    const subActions: SetModeStatusSubAction[] = SetModeStatusAction.getSubActions() as SetModeStatusSubAction[]
    console.log()
    expect(subActions[0].params.config).toStrictEqual(data.params.config)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetModeStatusTxBuilder
        const mockTxBuilder = data.params.modeStatuses[i]
        expect(txBuilder.mode === mockTxBuilder.mode).toBeTruthy()

        Object.keys(txBuilder.status).forEach((key) => {
          const poolConfigKey = key as keyof ModeStatus
          expect(txBuilder.status[poolConfigKey] === mockTxBuilder.status[poolConfigKey]).toBeTruthy()
        })
      }
    }
  })
})
