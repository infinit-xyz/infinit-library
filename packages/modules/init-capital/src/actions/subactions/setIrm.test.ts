import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetIrmSubAction, SetIrmSubActionParams } from '@actions/subactions/setIrm'

import { SetIrmTxBuilder } from './tx-builders/Pool/setIrm'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetIrmSubAction extends SetIrmSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetIrmSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetIrmSubActionParams = {
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      irm: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
    }
    const SetIrmSubAction = new TestSetIrmSubAction(client, params)
    expect(SetIrmSubAction.txBuilders.length).toStrictEqual(1)
    const txBuilder: SetIrmTxBuilder = SetIrmSubAction.txBuilders[0] as SetIrmTxBuilder
    expect(txBuilder.pool).toStrictEqual(params.pool)
    expect(txBuilder.irm).toStrictEqual(params.irm)
  })
})
