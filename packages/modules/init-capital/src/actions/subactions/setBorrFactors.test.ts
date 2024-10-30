import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetBorrFactorsSubAction, SetBorrFactorsSubActionParams } from './setBorrFactors'
import { SetBorrFactorE18TxBuilder } from './tx-builders/Config/setBorrFactors_e18'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetBorrFactorsSubAction extends SetBorrFactorsSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester

const compareArrays = <type>(a: type[], b: type[]) => a.length === b.length && a.every((element, index) => element === b[index])

describe('SetBorrFactorsSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct calldata', async () => {
    const params: SetBorrFactorsSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      factors_e18: [parseUnits('0.9', 18), parseUnits('0.8', 18)],
    }

    const setModeFactorsSubAction = new TestSetBorrFactorsSubAction(client, params)

    const txBuilder = setModeFactorsSubAction.txBuilders[0] as SetBorrFactorE18TxBuilder
    console.log(txBuilder.pools)
    console.log(params.pools)
    expect(compareArrays(txBuilder.pools, params.pools)).toBeTruthy()
    expect(compareArrays(txBuilder.pools, params.pools)).toBeTruthy()
  })
})
