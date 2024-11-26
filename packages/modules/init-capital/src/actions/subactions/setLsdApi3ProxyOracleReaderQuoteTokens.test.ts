import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  SetLsdApi3ProxyOracleReaderQuoteTokensSubAction,
  SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams,
} from '@actions/subactions/setLsdApi3ProxyOracleReaderQuoteTokens'
import { SetQuoteTokensTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setQuoteTokens'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetApi3ProxyOracleReaderMaxStaleTimesSubAction extends SetLsdApi3ProxyOracleReaderQuoteTokensSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

describe('SetLsdApi3ProxyOracleReaderQuoteTokensSubAction', async () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test calldata should be matched', async () => {
    const params: SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams = {
      lsdApi3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      quoteTokens: ['0x0000000000000000000000000000000000000003', '0x0000000000000000000000000000000000000004'],
    }
    const setApi3ProxyOracleReaderDataFeedProxiesSubAction = new TestSetApi3ProxyOracleReaderMaxStaleTimesSubAction(client, params)

    for (let i = 0; i < setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders.length; i++) {
      const txBuilder = setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders[i] as SetQuoteTokensTxBuilder
      for (let j = 0; j < txBuilder.tokens.length; j++) {
        expect(txBuilder.tokens[j]).toStrictEqual(params.tokens[j])
        expect(txBuilder.quoteTokens[j]).toStrictEqual(params.quoteTokens[j])
      }
    }
  })
})
