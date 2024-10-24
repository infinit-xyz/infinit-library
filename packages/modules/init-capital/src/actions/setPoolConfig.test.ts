import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetPoolConfigAction, SetPoolConfigActionData } from './setPoolConfig'
import { SetPoolConfigSubAction } from './subactions/setPoolConfigs'
import { PoolConfig, SetPoolConfigTxBuilder } from './subactions/tx-builders/Config/setPoolConfig'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetPoolConfigActionTest extends SetPoolConfigAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfig', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetPoolConfigAction.name).toStrictEqual('SetPoolConfigAction')
  })
  test('test correct calldata', async () => {
    const data: SetPoolConfigActionData = {
      signer: { guardian: client },
      params: {
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
      },
    }
    // data.
    const setPoolConfigAction = new SetPoolConfigActionTest(data)
    const subActions: SetPoolConfigSubAction[] = setPoolConfigAction.getSubActions() as SetPoolConfigSubAction[]
    console.log()
    expect(subActions[0].params.config).toStrictEqual(data.params.config)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetPoolConfigTxBuilder
        const mockTxBuilder = data.params.batchPoolConfigParams[i]
        expect(txBuilder.pool === mockTxBuilder.pool).toBeTruthy()

        Object.keys(txBuilder.poolConfig).forEach((key) => {
          const poolConfigKey = key as keyof PoolConfig
          expect(txBuilder.poolConfig[poolConfigKey] === mockTxBuilder.poolConfig[poolConfigKey]).toBeTruthy()
        })
      }
    }
  })
})
