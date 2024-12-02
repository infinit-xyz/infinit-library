import { beforeAll, describe, expect, test } from 'vitest'

import { Address, getAddress, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetInitOracleSourcesAction, SetInitOracleSourcesActionParams, oracleReaderRegistryName } from '@actions/setInitOracleSources'

import { ARBITRUM_TEST_ADDRESSES } from './__mock__/address'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain } from '@infinit-xyz/test'
import { TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetInitOracleSources', async () => {
  let guardian: TestInfinitWallet
  let governor: TestInfinitWallet
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    guardian = new TestInfinitWallet(TestChain.arbitrum, account1.address)
    governor = new TestInfinitWallet(TestChain.arbitrum, account2.address)
    registry = await setupInitCapital()
  })

  test('test correct name', async () => {
    expect(SetInitOracleSourcesAction.name).toStrictEqual('SetInitOracleSourcesAction')
  })

  test('set init Oracle Sources Action', async () => {
    const setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams = {
      token: ARBITRUM_TEST_ADDRESSES.usdc,
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f',
            maxStaleTime: 86400n,
          },
        },
        secondarySource: {
          type: 'pyth',
          params: {
            priceFeed: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
            maxStaleTime: 86400n,
          },
        },
        maxPriceDeviationE18: parseUnits('1.1', 18),
      },
    }
    const action = new SetInitOracleSourcesAction({
      signer: { governor: governor },
      params: setInitOracleSourcesActionParams,
    })

    registry = await action.run(registry)

    // validate
    await validateInitOracle(guardian, setInitOracleSourcesActionParams, registry)
  })

  test('set init Oracle Sources Action only primary source', async () => {
    const setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams = {
      token: ARBITRUM_TEST_ADDRESSES.usdc,
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f',
            maxStaleTime: 86400n,
          },
        },
      },
    }
    const action = new SetInitOracleSourcesAction({
      signer: { governor: governor },
      params: setInitOracleSourcesActionParams,
    })

    registry = await action.run(registry)

    // validate
    await validateInitOracle(guardian, setInitOracleSourcesActionParams, registry)
  })

  test('set init Oracle Sources Action has secondary source but no max price deviation should be rejected', async () => {
    const setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams = {
      token: ARBITRUM_TEST_ADDRESSES.usdc,
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f',
            maxStaleTime: 86400n,
          },
        },
        secondarySource: {
          type: 'pyth',
          params: {
            priceFeed: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
            maxStaleTime: 86400n,
          },
        },
      },
    }
    const action = new SetInitOracleSourcesAction({
      signer: { governor: governor },
      params: setInitOracleSourcesActionParams,
    })

    await expect(action.run(registry)).rejects.toThrowError(
      'Please check your input params\nNeed to provide both secondary source and max price deviation if one of them is provided',
    )
  })

  test('set init Oracle Sources Action has max price deviation but no secondary source should be rejected', async () => {
    const setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams = {
      token: ARBITRUM_TEST_ADDRESSES.usdc,
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f',
            maxStaleTime: 86400n,
          },
        },
        maxPriceDeviationE18: parseUnits('1.1', 18),
      },
    }
    const action = new SetInitOracleSourcesAction({
      signer: { governor: governor },
      params: setInitOracleSourcesActionParams,
    })

    await expect(action.run(registry)).rejects.toThrowError(
      'Please check your input params\nNeed to provide both secondary source and max price deviation if one of them is provided',
    )
  })
})

const validateInitOracle = async (
  guardian: TestInfinitWallet,
  setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams,
  registry: InitCapitalRegistry,
) => {
  const initOracleArtifact = await readArtifact('InitOracle')
  const priceE36 = await guardian.publicClient.readContract({
    address: registry.initOracleProxy!,
    abi: initOracleArtifact.abi,
    functionName: 'getPrice_e36',
    args: [setInitOracleSourcesActionParams.token],
  })
  expect(priceE36).toBeGreaterThan(0n)
  if (setInitOracleSourcesActionParams.oracleConfig?.primarySource?.type) {
    const name = setInitOracleSourcesActionParams.oracleConfig.primarySource.type
    const primarySourceConfigName = oracleReaderRegistryName[name]
    const primarySource = await guardian.publicClient.readContract({
      address: registry.initOracleProxy!,
      abi: initOracleArtifact.abi,
      functionName: 'primarySources',
      args: [setInitOracleSourcesActionParams.token],
    })
    expect(primarySource).toStrictEqual(getAddress(registry[primarySourceConfigName] as Address))
  }
  if (setInitOracleSourcesActionParams.oracleConfig?.secondarySource?.type) {
    const name = setInitOracleSourcesActionParams.oracleConfig.secondarySource.type
    const primarySourceConfigName = oracleReaderRegistryName[name]
    const primarySource = await guardian.publicClient.readContract({
      address: registry.initOracleProxy!,
      abi: initOracleArtifact.abi,
      functionName: 'secondarySources',
      args: [setInitOracleSourcesActionParams.token],
    })
    expect(primarySource).toStrictEqual(getAddress(registry[primarySourceConfigName] as Address))
  }
}
