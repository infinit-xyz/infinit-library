import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  Api3Params,
  LsdApi3Params,
  PythParams,
  SetNewPoolOracleReaderSubAction,
  SetNewPoolOracleReaderSubActionParams,
  SourceConfig,
} from '@actions/subactions/setNewPoolOracleReader'
import { SetDataFeedProxiesTxBuilder as Api3SetDataFeedProxiesTxBuilder } from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setDataFeedProxies'
import { SetMaxStaleTimesTxBuilder as Api3SetMaxStaleTimesTxBuilder } from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'
import { SetDataFeedProxiesTxBuilder as LsdApi3SetDataFeedProxiesTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setDataFeedProxies'
import { SetMaxStaleTimesTxBuilder as LsdApi3SetMaxStaleTimesTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setMaxStaleTimes'
import { SetQuoteTokensTxBuilder as LsdApi3SetQuoteTokensTxBuilder } from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setQuoteTokens'
import { SetMaxStaleTimesTxBuilder as PythSetMaxStaleTimesTxBuilder } from '@actions/subactions/tx-builders/PythOracleReader/setMaxStaleTimes'
import { SetPriceIdsTxBuilder as PythSetPriceIdsTxBuilder } from '@actions/subactions/tx-builders/PythOracleReader/setPriceIds'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetNewPoolOracleReaderSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetNewPoolOracleReaderSubActionParams = {
      primarySource: {
        type: 'api3',
        token: '0x0000000000000000000000000000000000000001',
        oracleReader: '0x0000000000000000000000000000000000000002',
        params: {
          dataFeedProxy: '0x0000000000000000000000000000000000000003',
          maxStaleTime: 2000n,
        },
      },
      secondarySource: {
        type: 'pyth',
        token: '0x0000000000000000000000000000000000000001',
        oracleReader: '0x0000000000000000000000000000000000000002',
        params: {
          priceFeed: '0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6',
          maxStaleTime: 2000n,
        },
      },
    }
    const setNewPoolOracleReaderSubAction = new SetNewPoolOracleReaderSubAction(client, params)
    // check callData
    if (params.primarySource) checkCalldata(params.primarySource, setNewPoolOracleReaderSubAction)
    if (params.secondarySource) checkCalldata(params.secondarySource, setNewPoolOracleReaderSubAction)
    // should have no txBuilders left
    expect(setNewPoolOracleReaderSubAction.txBuilders.length).toBe(0)
  })

  test('test correct calldata with secondary source undefined', async () => {
    const params: SetNewPoolOracleReaderSubActionParams = {
      primarySource: {
        type: 'api3',
        token: '0x0000000000000000000000000000000000000001',
        oracleReader: '0x0000000000000000000000000000000000000002',
        params: {
          dataFeedProxy: '0x0000000000000000000000000000000000000003',
          maxStaleTime: 2000n,
        },
      },
      secondarySource: undefined,
    }
    const setNewPoolOracleReaderSubAction = new SetNewPoolOracleReaderSubAction(client, params)
    // check callData
    if (params.primarySource) checkCalldata(params.primarySource, setNewPoolOracleReaderSubAction)
    if (params.secondarySource) checkCalldata(params.secondarySource, setNewPoolOracleReaderSubAction)
    // should have no txBuilders left
    expect(setNewPoolOracleReaderSubAction.txBuilders.length).toBe(0)
  })
  test('test lsdApi3 with no params', async () => {
    const params: SetNewPoolOracleReaderSubActionParams = {
      primarySource: {
        type: 'lsdApi3',
        token: '0x0000000000000000000000000000000000000001',
        oracleReader: '0x0000000000000000000000000000000000000002',
        params: {
          dataFeedProxy: '0x0000000000000000000000000000000000000003',
          maxStaleTime: 2000n,
          quoteToken: {
            token: '0x0000000000000000000000000000000000000004',
          },
        },
      },
      secondarySource: undefined,
    }
    const setNewPoolOracleReaderSubAction = new SetNewPoolOracleReaderSubAction(client, params)
    // check callData
    if (params.primarySource) checkCalldata(params.primarySource, setNewPoolOracleReaderSubAction)
    if (params.secondarySource) checkCalldata(params.secondarySource, setNewPoolOracleReaderSubAction)
    // should have no txBuilders left
    expect(setNewPoolOracleReaderSubAction.txBuilders.length).toBe(0)
  })

  test('test lsdApi3 with params', async () => {
    const params: SetNewPoolOracleReaderSubActionParams = {
      primarySource: {
        type: 'lsdApi3',
        token: '0x0000000000000000000000000000000000000001',
        oracleReader: '0x0000000000000000000000000000000000000002',
        params: {
          dataFeedProxy: '0x0000000000000000000000000000000000000003',
          maxStaleTime: 2000n,
          quoteToken: {
            token: '0x0000000000000000000000000000000000000004',
            params: {
              oracleReader: '0x0000000000000000000000000000000000000005',
              dataFeedProxy: '0x0000000000000000000000000000000000000006',
              maxStaleTime: 2001n,
            },
          },
        },
      },
      secondarySource: undefined,
    }
    const setNewPoolOracleReaderSubAction = new SetNewPoolOracleReaderSubAction(client, params)
    // check callData
    if (params.primarySource) checkCalldata(params.primarySource, setNewPoolOracleReaderSubAction)
    if (params.secondarySource) checkCalldata(params.secondarySource, setNewPoolOracleReaderSubAction)
    // should have no txBuilders left
    expect(setNewPoolOracleReaderSubAction.txBuilders.length).toBe(0)
  })
})

const checkCalldata = (source: SourceConfig, subAction: SetNewPoolOracleReaderSubAction) => {
  let txBuilder:
    | Api3SetDataFeedProxiesTxBuilder
    | Api3SetMaxStaleTimesTxBuilder
    | PythSetPriceIdsTxBuilder
    | PythSetMaxStaleTimesTxBuilder
    | LsdApi3SetDataFeedProxiesTxBuilder
    | LsdApi3SetMaxStaleTimesTxBuilder
    | LsdApi3SetQuoteTokensTxBuilder

  if (source) {
    const { type } = source
    switch (type) {
      case 'api3':
        {
          const params = source.params as Api3Params
          txBuilder = subAction.txBuilders.shift() as Api3SetDataFeedProxiesTxBuilder
          expect(txBuilder.api3ProxyOracleReader === source.oracleReader).toBeTruthy()
          expect(txBuilder.dataFeedProxies[0] === params.dataFeedProxy).toBeTruthy()
          txBuilder = subAction.txBuilders.shift() as Api3SetMaxStaleTimesTxBuilder
          expect(txBuilder.tokens[0] === source.token).toBeTruthy()
          expect(txBuilder.maxStaleTimes[0] === params.maxStaleTime).toBeTruthy()
        }
        break
      case 'pyth':
        {
          const params = source.params as PythParams
          txBuilder = subAction.txBuilders.shift() as PythSetPriceIdsTxBuilder
          expect(txBuilder.pythOracleReader === source.oracleReader).toBeTruthy()
          expect(txBuilder.priceIds[0] === params.priceFeed).toBeTruthy()
          txBuilder = subAction.txBuilders.shift() as PythSetMaxStaleTimesTxBuilder
          expect(txBuilder.tokens[0] === source.token).toBeTruthy()
          expect(txBuilder.maxStaleTimes[0] === params.maxStaleTime).toBeTruthy()
        }
        break
      case 'lsdApi3':
        {
          const params = source.params as LsdApi3Params
          if (params.quoteToken.params) {
            txBuilder = subAction.txBuilders.shift() as Api3SetDataFeedProxiesTxBuilder
            expect(txBuilder.api3ProxyOracleReader === params.quoteToken.params.oracleReader).toBeTruthy()
            expect(txBuilder.dataFeedProxies[0] === params.quoteToken.params.dataFeedProxy).toBeTruthy()
            txBuilder = subAction.txBuilders.shift() as Api3SetMaxStaleTimesTxBuilder
            expect(txBuilder.tokens[0] === params.quoteToken.token).toBeTruthy()
            expect(txBuilder.maxStaleTimes[0] === params.quoteToken.params.maxStaleTime).toBeTruthy()
          }
          txBuilder = subAction.txBuilders.shift() as LsdApi3SetDataFeedProxiesTxBuilder
          expect(txBuilder.lsdApi3ProxyOracleReader === source.oracleReader).toBeTruthy()
          expect(txBuilder.dataFeedProxies[0] === params.dataFeedProxy).toBeTruthy()
          txBuilder = subAction.txBuilders.shift() as LsdApi3SetMaxStaleTimesTxBuilder
          expect(txBuilder.tokens[0] === source.token).toBeTruthy()
          expect(txBuilder.maxStaleTimes[0] === params.maxStaleTime).toBeTruthy()
          txBuilder = subAction.txBuilders.shift() as LsdApi3SetQuoteTokensTxBuilder
          expect(txBuilder.tokens[0] === source.token).toBeTruthy()
          expect(txBuilder.quoteTokens[0] === params.quoteToken.token).toBeTruthy()
        }
        break
    }
  }
}
