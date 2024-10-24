import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetPoolConfigSubAction, SetPoolConfigSubActionParams } from './setPoolConfigs'
import { PoolConfig, SetPoolConfigTxBuilder } from './tx-builders/Config/setPoolConfig'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetPoolConfigSubAction extends SetPoolConfigSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetPoolConfigSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      batchPoolConfigParams: [
        {
          pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
          poolConfig: {
            supplyCap: BigInt(12345),
            borrowCap: BigInt(9999),
            canMint: false,
            canBurn: false,
            canBorrow: false,
            canRepay: false,
            canFlash: false,
          },
        },
        {
          pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          poolConfig: {
            supplyCap: BigInt(8888),
            borrowCap: BigInt(2222),
            canMint: true,
            canBurn: true,
            canBorrow: true,
            canRepay: false,
            canFlash: false,
          },
        },
      ],
    }
    const setPoolConfigSubAction = new TestSetPoolConfigSubAction(client, params)

    for (let i = 0; i < setPoolConfigSubAction.txBuilders.length; i++) {
      const txBuilder = setPoolConfigSubAction.txBuilders[i] as SetPoolConfigTxBuilder
      const mockTxBuilder = params.batchPoolConfigParams[i]
      expect(txBuilder.pool === mockTxBuilder.pool).toBeTruthy()

      Object.keys(txBuilder.poolConfig).forEach((key) => {
        const poolConfigKey = key as keyof PoolConfig
        expect(txBuilder.poolConfig[poolConfigKey] === mockTxBuilder.poolConfig[poolConfigKey]).toBeTruthy()
      })
    }
  })
})
