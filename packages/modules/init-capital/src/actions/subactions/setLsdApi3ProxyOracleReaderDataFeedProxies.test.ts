import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction,
  SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams,
} from '@actions/subactions/setLsdApi3ProxyOracleReaderDataFeedProxies'
import { SetDataFeedProxiesTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setDataFeedProxies'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction extends SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

describe('SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction', async () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test calldata should be matched', async () => {
    const params: SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams = {
      lsdApi3ProxyOracleReader: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokens: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
      dataFeedProxies: ['0x0000000000000000000000000000000000000003', '0x0000000000000000000000000000000000000004'],
    }
    const setApi3ProxyOracleReaderDataFeedProxiesSubAction = new TestSetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction(client, params)

    for (let i = 0; i < setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders.length; i++) {
      const txBuilder = setApi3ProxyOracleReaderDataFeedProxiesSubAction.txBuilders[i] as SetDataFeedProxiesTxBuilder
      for (let j = 0; j < txBuilder.tokens.length; j++) {
        expect(txBuilder.tokens[j]).toStrictEqual(params.tokens[j])
        expect(txBuilder.dataFeedProxies[j]).toStrictEqual(params.dataFeedProxies[j])
      }
    }
  })
})