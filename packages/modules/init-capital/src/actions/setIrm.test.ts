import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetIrmAction, SetIrmActionData } from './setIrm'
import { SetIrmSubAction } from './subactions/setIrm'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetIrmActionTest extends SetIrmAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetIrm', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetIrmAction.name).toStrictEqual('SetIrmAction')
  })
  test('test correct calldata', async () => {
    const data: SetIrmActionData = {
      signer: { guardian: client },
      params: {
        pool: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        irm: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
      },
    }
    // data.
    const setIrmAction: SetIrmActionTest = new SetIrmActionTest(data)
    const subActions: SetIrmSubAction[] = setIrmAction.getSubActions() as SetIrmSubAction[]

    expect(subActions.length).toStrictEqual(1)
    expect(subActions[0].params.pool).toStrictEqual(data.params.pool)
    expect(subActions[0].params.irm).toStrictEqual(data.params.irm)
  })
})
