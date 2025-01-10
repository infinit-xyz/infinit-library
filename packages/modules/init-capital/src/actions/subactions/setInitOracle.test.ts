import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetInitOracleConfigSubAction, SetInitOracleConfigSubActionParams, TokenConfig } from '@actions/subactions/setInitOracle'
import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'
import { SetPrimarySourcesTxBuilder } from '@actions/subactions/tx-builders/InitOracle/setPrimarySources'
import { SetSecondarySourcesTxBuilder } from '@actions/subactions/tx-builders/InitOracle/setSecondarySources'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

const tester = ARBITRUM_TEST_ADDRESSES.tester

describe('SetInitOracleConfigSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetInitOracleConfigSubActionParams = {
      initOracle: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      tokenConfigs: [
        {
          token: '0x0000000000000000000000000000000000000001',
          primarySource: '0x0000000000000000000000000000000000000002',
          secondarySource: '0x0000000000000000000000000000000000000003',
          maxPriceDeviation_e18: 1000n,
        },
        {
          token: '0x0000000000000000000000000000000000000004',
          primarySource: '0x0000000000000000000000000000000000000005',
          secondarySource: '0x0000000000000000000000000000000000000006',
          maxPriceDeviation_e18: 2000n,
        },
        {
          token: '0x0000000000000000000000000000000000000007',
          primarySource: '0x0000000000000000000000000000000000000008',
        },
        {
          token: '0x0000000000000000000000000000000000000009',
          primarySource: '0x0000000000000000000000000000000000000010',
        },
        {
          token: '0x0000000000000000000000000000000000000011',
          maxPriceDeviation_e18: 2000n,
        },
      ],
    }

    const setInitOracleConfigSubAction = new SetInitOracleConfigSubAction(client, params)

    // validate primary sources
    const primarySourcesFilteredParams = params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.primarySource === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])

    if (primarySourcesFilteredParams.length > 0) {
      const txBuilder = setInitOracleConfigSubAction.txBuilders.shift() as SetPrimarySourcesTxBuilder
      expect(txBuilder.initOracle === params.initOracle).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.tokens,
          primarySourcesFilteredParams.map((config) => config.token),
        ),
      ).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.sources,
          primarySourcesFilteredParams.map((config) => config.primarySource),
        ),
      ).toBeTruthy()
    }

    // validate secondary sources
    const secondarySourcesFilteredParams = params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.secondarySource === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])
    if (secondarySourcesFilteredParams.length > 0) {
      const txBuilder = setInitOracleConfigSubAction.txBuilders.shift() as SetSecondarySourcesTxBuilder
      expect(txBuilder.initOracle === params.initOracle).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.tokens,
          secondarySourcesFilteredParams.map((config) => config.token),
        ),
      ).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.sources,
          secondarySourcesFilteredParams.map((config) => config.secondarySource),
        ),
      ).toBeTruthy()
    }

    // validate maxprice deviation
    const maxPriceDeviationsFilteredParams = params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.maxPriceDeviation_e18 === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])
    if (maxPriceDeviationsFilteredParams.length > 0) {
      const txBuilder = setInitOracleConfigSubAction.txBuilders.shift() as SetMaxPriceDeviations_e18TxBuilder
      expect(txBuilder.initOracle === params.initOracle).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.tokens,
          maxPriceDeviationsFilteredParams.map((config) => config.token),
        ),
      ).toBeTruthy()
      expect(
        compareArrays(
          txBuilder.maxPriceDeviations_e18s,
          maxPriceDeviationsFilteredParams.map((config) => config.maxPriceDeviation_e18),
        ),
      ).toBeTruthy()
    }
    // shouldn't have any txBuilders left
    expect(setInitOracleConfigSubAction.txBuilders.length).toBe(0)
  })
})

const compareArrays = <type>(a: type[], b: type[]) => a.length === b.length && a.every((element, index) => element === b[index])
