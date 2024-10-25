import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetOracleAction, SetOracleActionData } from './setOracle'
import { SetOracleSubAction } from './subactions/setOracle'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetOracleActionTest extends SetOracleAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetOracle', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetOracleAction.name).toStrictEqual('SetOracleAction')
  })
  test('test correct calldata', async () => {
    const data: SetOracleActionData = {
      signer: { governor: client },
      params: {
        initCore: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        oracle: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      },
    }
    // data.
    const SetOracleAction = new SetOracleActionTest(data)
    const subActions: SetOracleSubAction[] = SetOracleAction.getSubActions() as SetOracleSubAction[]
    console.log()
    expect(subActions.length).toStrictEqual(1)
    expect(subActions[0].params.initCore).toStrictEqual(data.params.initCore)
    expect(subActions[0].params.oracle).toStrictEqual(data.params.oracle)
  })
})
