import { beforeAll, describe, expect, test } from 'vitest'

import { Address, getAddress, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { ARBITRUM_TEST_ADDRESSES } from './__mock__/address'
import { SupportNewPoolActionParams, SupportNewPoolsAction, oracleReaderRegistryName } from './supportNewPools'
// import { ModeStatus, SetModeStatusTxBuilder } from './subactions/tx-builders/Config/setModeStatus'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SupportNewPoolsTest', async () => {
  // let client: InfinitWallet
  let registry: InitCapitalRegistry
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client1 = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('support new pools', async () => {
    const pool1ActionParams: SupportNewPoolActionParams = {
      name: 'test_new_pool',
      token: ARBITRUM_TEST_ADDRESSES.weth,
      modeConfigs: [
        {
          mode: 1,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
          },
          config: {
            liqIncentiveMultiplierE18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
            maxHealthAfterLiqE18: parseUnits('1.1', 18),
          },
        },
        {
          mode: 2,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
          },
          config: {
            liqIncentiveMultiplierE18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
            maxHealthAfterLiqE18: parseUnits('1.2', 18),
          },
        },
      ],
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xf624881ac131210716F7708C28403cCBe346cB73',
            maxStaleTime: 86400n,
          },
        },
        secondarySource: {
          type: 'pyth',
          params: {
            priceFeed: '0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6',
            maxStaleTime: 86400n,
          },
        },
        maxPriceDeviationE18: parseUnits('1.1', 18),
      },
      liqcentiveMultiplier_e18: parseUnits('1.1', 18),
      supplyCap: parseUnits('1000000', 18),
      borrowCap: parseUnits('1000000', 18),
      reserveFactor: parseUnits('0.1', 18),
      treasury: ARBITRUM_TEST_ADDRESSES.oneAddress,
      doubleSlopeIRMConfig: {
        name: 'testIRM',
        params: {
          baseBorrowRateE18: 100000000000000000n,
          jumpUtilizationRateE18: 800000000000000000n,
          borrowRateMultiplierE18: 10000000000000000n,
          jumpRateMultiplierE18: 10000000000000000n,
        },
      },
    }

    const pools = [pool1ActionParams]
    const action = new SupportNewPoolsAction({
      params: {
        pools: pools,
      },
      signer: { deployer: client1, guardian: client1, governor: client2 },
    })
    const newRegistry = await action.run(registry)

    for (const pool of pools) {
      // validate mode status
      await validateModeStatus(client1, pool, newRegistry)
      // validate mode config
      await validateModeConfig(client1, pool, newRegistry)
      // validate init oracle
      await validateInitOracle(client1, pool, newRegistry)
      // validate lending pool
      await validateLendingPool(client1, pool, newRegistry)
    }
  })
})

// validate functions
const validateModeStatus = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const configArtifact = await readArtifact('Config')
  const modes = pool.modeConfigs.map((modeConfig) => modeConfig.mode)
  for (let i = 0; i < modes.length; i++) {
    const mode = modes[i]
    const onChainConfig = await client.publicClient.readContract({
      address: registry.configProxy!,
      abi: configArtifact.abi,
      functionName: 'getModeStatus',
      args: [mode],
    })
    expect(onChainConfig.canCollateralize).toStrictEqual(true)
    expect(onChainConfig.canDecollateralize).toStrictEqual(true)
    expect(onChainConfig.canBorrow).toStrictEqual(true)
    expect(onChainConfig.canRepay).toStrictEqual(true)
  }
}

const validateModeConfig = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const configArtifact = await readArtifact('Config')
  const modes = pool.modeConfigs.map((modeConfig) => modeConfig.mode)
  for (let i = 0; i < modes.length; i++) {
    const mode = modes[i]
    const [collTokens, borrTokens, _maxHealthAfterLiq, maxCollWLpCount] = await client.publicClient.readContract({
      address: registry.configProxy!,
      abi: configArtifact.abi,
      functionName: 'getModeConfig',
      args: [mode],
    })
    expect(collTokens).toStrictEqual([getAddress(registry.lendingPools![pool.name].lendingPool)])
    expect(borrTokens).toStrictEqual([getAddress(registry.lendingPools![pool.name].lendingPool)])
    expect(maxCollWLpCount).toStrictEqual(0)
  }
}

const validateLendingPool = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const lendingPoolArtifact = await readArtifact('LendingPool')
  // validate reserve factor
  const reserveFactor = await client.publicClient.readContract({
    address: registry.lendingPools![pool.name].lendingPool,
    abi: lendingPoolArtifact.abi,
    functionName: 'reserveFactor_e18',
    args: [],
  })
  expect(reserveFactor).toStrictEqual(pool.reserveFactor)
  // validate treasury address
  const treasury = await client.publicClient.readContract({
    address: registry.lendingPools![pool.name].lendingPool,
    abi: lendingPoolArtifact.abi,
    functionName: 'treasury',
    args: [],
  })
  expect(treasury).toStrictEqual(getAddress(pool.treasury))
  // validate underlying token
  const underlyingToken = await client.publicClient.readContract({
    address: registry.lendingPools![pool.name].lendingPool,
    abi: lendingPoolArtifact.abi,
    functionName: 'underlyingToken',
    args: [],
  })
  expect(underlyingToken).toStrictEqual(getAddress(pool.token))
  // validate irm
  const irm = await client.publicClient.readContract({
    address: registry.lendingPools![pool.name].lendingPool,
    abi: lendingPoolArtifact.abi,
    functionName: 'irm',
    args: [],
  })
  expect(irm).toStrictEqual(getAddress(registry.irms![pool.doubleSlopeIRMConfig.name]))
}
const validateInitOracle = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const initOracleArtifact = await readArtifact('InitOracle')
  const priceE36 = await client.publicClient.readContract({
    address: registry.initOracleProxy!,
    abi: initOracleArtifact.abi,
    functionName: 'getPrice_e36',
    args: [pool.token],
  })
  expect(priceE36).toBeGreaterThan(0n)
  if (pool.oracleConfig?.primarySource?.type) {
    const name = pool.oracleConfig.primarySource.type
    const primarySourceConfigName = oracleReaderRegistryName[name]
    const primarySource = await client.publicClient.readContract({
      address: registry.initOracleProxy!,
      abi: initOracleArtifact.abi,
      functionName: 'primarySources',
      args: [pool.token],
    })
    expect(primarySource).toStrictEqual(getAddress(registry[primarySourceConfigName] as Address))
  }
  if (pool.oracleConfig?.secondarySource?.type) {
    const name = pool.oracleConfig.secondarySource.type
    const primarySourceConfigName = oracleReaderRegistryName[name]
    const primarySource = await client.publicClient.readContract({
      address: registry.initOracleProxy!,
      abi: initOracleArtifact.abi,
      functionName: 'secondarySources',
      args: [pool.token],
    })
    expect(primarySource).toStrictEqual(getAddress(registry[primarySourceConfigName] as Address))
  }
}
