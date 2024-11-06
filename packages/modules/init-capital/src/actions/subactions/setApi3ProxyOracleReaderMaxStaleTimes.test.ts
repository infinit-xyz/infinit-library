import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  SetApi3ProxyOracleReaderMaxStaleTimesSubAction,
  SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams,
} from '@actions/subactions/setApi3ProxyOracleReaderMaxStaleTimes'
import { SetMaxStaleTimesTxBuilder } from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetApi3ProxyOracleReaderMaxStaleTimesSubAction extends SetApi3ProxyOracleReaderMaxStaleTimesSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

describe('SetApi3ProxyOracleReaderMaxStaleTimesSubAction', async () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  const oneDay = 60n * 60n * 24n
  test('test calldata should be matched', async () => {
    const params: SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams = {
      api3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      maxStaleTimes: [oneDay, 2n * oneDay],
    }
    const setApi3ProxyOracleReaderDataFeedProxiesSubAction = new TestSetApi3ProxyOracleReaderMaxStaleTimesSubAction(client, params)

    for (let i = 0; i < setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders.length; i++) {
      const txBuilder = setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders[i] as SetMaxStaleTimesTxBuilder
      for (let j = 0; j < txBuilder.tokens.length; j++) {
        expect(txBuilder.tokens[j]).toStrictEqual(params.tokens[j])
        expect(txBuilder.maxStaleTimes[j]).toStrictEqual(params.maxStaleTimes[j])
      }
    }
  })
})
