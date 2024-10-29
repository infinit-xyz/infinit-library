import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetModeFactorsSubAction, SetModeFactorsSubActionParams } from './setModeFactors'
import { SetBorrFactorE18TxBuilder } from './tx-builders/Config/setBorrFactors_e18'
import { SetCollFactorE18TxBuilder } from './tx-builders/Config/setCollFactors_e18'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetModeFactorsSubAction extends SetModeFactorsSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeFactorsSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetModeFactorsSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      poolFactors: [
        {
          pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
          collFactor: 123n,
          borrFactor: 999n,
        },
        {
          pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          collFactor: 123n,
          borrFactor: 999n,
        },
      ],
    }
    const setModeFactorsSubAction = new TestSetModeFactorsSubAction(client, params)

    // check setborr and setcoll txBuilders
    // type Test = SetBorrFactorE18TxBuilder | SetCollFactorE18TxBuilder
    for (let i = 0; i < setModeFactorsSubAction.txBuilders.length; i++) {
      const txBuilder = setModeFactorsSubAction.txBuilders[i]
      const mockTxBuilder = params.poolFactors[i].pool
      // expect(txBuilder.pool === mockTxBuilder.pool).toBeTruthy()

      // Object.keys(txBuilder.poolConfig).forEach((key) => {
      //   const poolConfigKey = key as keyof PoolConfig
      //   expect(txBuilder.poolConfig[poolConfigKey] === mockTxBuilder.poolConfig[poolConfigKey]).toBeTruthy()
      // })
    }
  })
})
