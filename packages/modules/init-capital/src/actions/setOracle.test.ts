import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { InitCapitalRegistry } from '../type'
import { ANVIL_PRIVATE_KEY_2 } from './__mock__/account'
import { setupInitCapital } from './__mock__/setup'
import { SetOracleAction, SetOracleActionData } from './setOracle'
import { SetOracleSubAction } from './subactions/setOracle'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetOracleActionTest extends SetOracleAction {
  public override getSubActions(registry: InitCapitalRegistry): SubAction[] {
    return super.getSubActions(registry)
  }
}

describe('SetOracle', async () => {
  let client: TestInfinitWallet
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    const governor = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    client = new TestInfinitWallet(TestChain.arbitrum, governor.address)
    registry = await setupInitCapital()
  })

  test('test correct name', async () => {
    expect(SetOracleAction.name).toStrictEqual('SetOracleAction')
  })

  test('test correct calldata', async () => {
    const data: SetOracleActionData = {
      signer: { governor: client },
      params: {
        oracle: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      },
    }
    // data.
    const SetOracleAction = new SetOracleActionTest(data)
    const subActions: SetOracleSubAction[] = SetOracleAction.getSubActions(registry) as SetOracleSubAction[]

    expect(subActions.length).toStrictEqual(1)
    expect(subActions[0].params.initCore).toStrictEqual(registry.initCoreProxy)
    expect(subActions[0].params.oracle).toStrictEqual(data.params.oracle)
  })
})
