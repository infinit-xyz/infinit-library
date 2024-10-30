import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetOracleSubAction } from './setOracle'
import { SetOracleTxBuilderParams } from './tx-builders/InitCore/setOracle'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetOracleSubAction extends SetOracleSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetOracleSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetOracleSubAction.name).toStrictEqual('SetOracleSubAction')
  })

  test('test correct calldata', async () => {
    const params: SetOracleTxBuilderParams = {
      initCore: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      oracle: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
    }
    const setOracleSubAction = new TestSetOracleSubAction(client, params)
    expect(setOracleSubAction.params.initCore).toStrictEqual(params.initCore)
    expect(setOracleSubAction.params.oracle).toStrictEqual(params.oracle)
  })
})
