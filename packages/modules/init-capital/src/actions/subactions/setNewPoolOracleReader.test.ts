import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  Api3Params,
  PythParams,
  SetNewPoolOracleReaderSubAction,
  SetNewPoolOracleReaderSubActionParams,
  SourceConfig,
} from '@actions/subactions/setNewPoolOracleReader'
import { SetDataFeedProxiesTxBuilder as Api3SetDataFeedProxiesTxBuilder } from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setDataFeedProxies'
import { SetMaxStaleTimesTxBuilder as Api3SetMaxStaleTimesTxBuilder } from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'
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
})

const checkCalldata = (source: SourceConfig, subAction: SetNewPoolOracleReaderSubAction) => {
  let txBuilder: Api3SetDataFeedProxiesTxBuilder | Api3SetMaxStaleTimesTxBuilder | PythSetPriceIdsTxBuilder | PythSetMaxStaleTimesTxBuilder
  if (source) {
    switch (source.type) {
      case 'api3':
        source.params = source.params as Api3Params
        txBuilder = subAction.txBuilders.shift() as Api3SetDataFeedProxiesTxBuilder
        expect(txBuilder.api3ProxyOracleReader === source.oracleReader).toBeTruthy()
        expect(txBuilder.dataFeedProxies[0] === source.params.dataFeedProxy).toBeTruthy()
        txBuilder = subAction.txBuilders.shift() as Api3SetMaxStaleTimesTxBuilder
        expect(txBuilder.tokens[0] === source.token).toBeTruthy()
        expect(txBuilder.maxStaleTimes[0] === source.params.maxStaleTime).toBeTruthy()
        break
      case 'pyth':
        source.params = source.params as PythParams
        txBuilder = subAction.txBuilders.shift() as PythSetPriceIdsTxBuilder
        expect(txBuilder.pythOracleReader === source.oracleReader).toBeTruthy()
        expect(txBuilder.priceIds[0] === source.params.priceFeed).toBeTruthy()
        txBuilder = subAction.txBuilders.shift() as PythSetMaxStaleTimesTxBuilder
        expect(txBuilder.tokens[0] === source.token).toBeTruthy()
        expect(txBuilder.maxStaleTimes[0] === source.params.maxStaleTime).toBeTruthy()
        break
      // TODO: handle lsdApi3
    }
  }
}
