import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { SetCollFactorsSubAction, SetCollFactorsSubActionParams } from './setCollFactors'
import { SetCollFactorE18TxBuilder } from './tx-builders/Config/setCollFactors_e18'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetCollFactorsSubAction extends SetCollFactorsSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester

const compareArrays = <type>(a: type[], b: type[]) => a.length === b.length && a.every((element, index) => element === b[index])

// TODO update config to use the address from base init capital test setup
describe('SetCollFactorsSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const registry: InitCapitalRegistry = {}

  test('test correct calldata', async () => {
    const params: SetCollFactorsSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      factors_e18: [parseUnits('1.01', 18), parseUnits('1.1', 18)],
    }

    const setModeFactorsSubAction = new TestSetCollFactorsSubAction(client, params)

    const txBuilder = setModeFactorsSubAction.txBuilders[0] as SetCollFactorE18TxBuilder
    expect(compareArrays(txBuilder.pools, params.pools)).toBeTruthy()
    expect(compareArrays(txBuilder.pools, params.pools)).toBeTruthy()
  })

  test('test update registry and message', async () => {
    const params: SetCollFactorsSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      mode: 1,
      pools: ['0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'],
      factors_e18: [parseUnits('1.01', 18), parseUnits('1.1', 18)],
    }

    const subAction = new TestSetCollFactorsSubAction(client, params)

    const result = await subAction.execute(registry, {})
    expect(result.newRegistry).toEqual(registry)
    expect(result.newMessage).toEqual({})
  })
})
