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
      name: 'INIT Ether',
      symbol: 'inWETH',
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
      liqIncentiveMultiplierE18: parseUnits('1.1', 18),
      supplyCap: parseUnits('1000000', 18),
      borrowCap: parseUnits('1000000', 18),
      reserveFactor: parseUnits('0.1', 18),
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

    const pool2ActionParams: SupportNewPoolActionParams = {
      name: 'INIT USDT',
      symbol: 'inUSDT',
      token: ARBITRUM_TEST_ADDRESSES.usdt,
      modeConfigs: [
        {
          mode: 1,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
          },
        },
        {
          mode: 2,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
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
      },
      liqIncentiveMultiplierE18: parseUnits('1.1', 18),
      supplyCap: parseUnits('1000000', 18),
      borrowCap: parseUnits('1000000', 18),
      reserveFactor: parseUnits('0.1', 18),
      doubleSlopeIRMConfig: {
        name: 'testIRM2',
        params: {
          baseBorrowRateE18: 100000000000000000n,
          jumpUtilizationRateE18: 800000000000000000n,
          borrowRateMultiplierE18: 10000000000000000n,
          jumpRateMultiplierE18: 10000000000000000n,
        },
      },
    }

    const pools = [pool1ActionParams, pool2ActionParams]
    const action = new SupportNewPoolsAction({
      params: {
        pools: pools,
      },
      signer: { deployer: client1, guardian: client1, governor: client2 },
    })
    const newRegistry = await action.run(registry)

    const modes = new Set<number>()
    const poolAddresses = []
    for (const pool of pools) {
      // validate mode status
      await validateModeStatus(client1, pool, newRegistry)
      // validate mode config
      await validateModeConfig(client1, pool, newRegistry)
      // validate init oracle
      await validateInitOracle(client1, pool, newRegistry)
      // validate lending pool
      await validateLendingPool(client1, pool, newRegistry)
      // validate pool config
      await validatePoolConfig(client1, pool, newRegistry)
      // validate irm
      await validateIrm(client1, pool, newRegistry)
      // collect modes and pools
      pool.modeConfigs.forEach((modeConfig) => modes.add(modeConfig.mode))
      poolAddresses.push(getAddress(newRegistry.lendingPools![pool.name].lendingPool))
    }
    // check borrowed tokens and collateral tokens
    for (const mode of modes) {
      const configArtifact = await readArtifact('Config')
      const [collTokens, borrTokens, _maxHealthAfterLiq, _maxCollWLpCount] = await client1.publicClient.readContract({
        address: newRegistry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getModeConfig',
        args: [mode],
      })
      expect(collTokens).toStrictEqual(poolAddresses)
      expect(borrTokens).toStrictEqual(poolAddresses)
    }
  })
})

// validate functions
const validatePoolConfig = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const configArtifact = await readArtifact('Config')

  const poolConfig = await client.publicClient.readContract({
    address: registry.configProxy!,
    abi: configArtifact.abi,
    functionName: 'getPoolConfig',
    args: [registry.lendingPools![pool.name].lendingPool],
  })
  expect(poolConfig.borrowCap).toStrictEqual(pool.borrowCap)
  expect(poolConfig.supplyCap).toStrictEqual(pool.supplyCap)
  expect(poolConfig.canBurn).toStrictEqual(true)
  expect(poolConfig.canMint).toStrictEqual(true)
  expect(poolConfig.canBorrow).toStrictEqual(true)
  expect(poolConfig.canFlash).toStrictEqual(true)
  expect(poolConfig.canRepay).toStrictEqual(true)
}
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
  const [configArtifact, riskManagerArtifact, liqIncentiveCalculatorArtifact] = await Promise.all([
    readArtifact('Config'),
    readArtifact('RiskManager'),
    readArtifact('LiqIncentiveCalculator'),
  ])
  for (const modeConfig of pool.modeConfigs) {
    const mode = modeConfig.mode
    const [_collTokens, _borrTokens, maxHealthAfterLiq, maxCollWLpCount] = await client.publicClient.readContract({
      address: registry.configProxy!,
      abi: configArtifact.abi,
      functionName: 'getModeConfig',
      args: [mode],
    })
    if (modeConfig.config) {
      expect(maxHealthAfterLiq).toStrictEqual(modeConfig.config.maxHealthAfterLiqE18)
    } else {
      expect(maxHealthAfterLiq).toBeGreaterThan(0n)
    }
    expect(maxCollWLpCount).toStrictEqual(0)
    // validate factors
    const factors = await client.publicClient.readContract({
      address: registry.configProxy!,
      abi: configArtifact.abi,
      functionName: 'getTokenFactors',
      args: [mode, getAddress(registry.lendingPools![pool.name].lendingPool)],
    })
    expect(factors.collFactor_e18).toStrictEqual(modeConfig.poolConfig.collFactorE18)
    expect(factors.borrFactor_e18).toStrictEqual(modeConfig.poolConfig.borrFactorE18)
    // validate debtCeiling
    const debtCeiling = await client.publicClient.readContract({
      address: registry.riskManagerProxy!,
      abi: riskManagerArtifact.abi,
      functionName: 'getModeDebtCeilingAmt',
      args: [mode, getAddress(registry.lendingPools![pool.name].lendingPool)],
    })
    expect(debtCeiling).toStrictEqual(modeConfig.poolConfig.debtCeiling)
    // --- validate mode liquidation ----
    // validate mode liquidation incentive
    const modeLiqIncentiveMultiplierE18 = await client.publicClient.readContract({
      address: registry.liqIncentiveCalculatorProxy!,
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'modeLiqIncentiveMultiplier_e18',
      args: [mode],
    })
    if (modeConfig.config) {
      expect(modeLiqIncentiveMultiplierE18).toStrictEqual(modeConfig.config.liqIncentiveMultiplierE18)
    } else {
      expect(modeLiqIncentiveMultiplierE18).toBeGreaterThan(0n)
    }
    // validate mode min liquidation incentive
    const minLiqIncentiveMultiplierE18 = await client.publicClient.readContract({
      address: registry.liqIncentiveCalculatorProxy!,
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'minLiqIncentiveMultiplier_e18',
      args: [mode],
    })
    if (modeConfig.config) {
      expect(minLiqIncentiveMultiplierE18).toStrictEqual(modeConfig.config.minLiqIncentiveMultiplierE18)
    } else {
      expect(minLiqIncentiveMultiplierE18).toBeGreaterThan(0n)
    }
  }
}

const validateLendingPool = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const [lendingPoolArtifact, liqIncentiveCalculatorArtifact] = await Promise.all([
    readArtifact('LendingPool'),
    readArtifact('LiqIncentiveCalculator'),
  ])
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
  expect(treasury).toStrictEqual(getAddress(registry.feeVault!))
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
  // validate token liq incentive
  const tokenLiqIncentiveMultiplier = await client.publicClient.readContract({
    address: registry.liqIncentiveCalculatorProxy!,
    abi: liqIncentiveCalculatorArtifact.abi,
    functionName: 'tokenLiqIncentiveMultiplier_e18',
    args: [pool.token],
  })
  expect(tokenLiqIncentiveMultiplier).toStrictEqual(pool.liqIncentiveMultiplierE18)
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
const validateIrm = async (client: TestInfinitWallet, pool: SupportNewPoolActionParams, registry: InitCapitalRegistry) => {
  const doubleSlopeIRMArtifact = await readArtifact('DoubleSlopeIRM')

  const baseBorrowRate = await client.publicClient.readContract({
    address: registry.irms![pool.doubleSlopeIRMConfig.name],
    abi: doubleSlopeIRMArtifact.abi,
    functionName: 'BASE_BORR_RATE_E18',
    args: [],
  })
  const jumpUtil = await client.publicClient.readContract({
    address: registry.irms![pool.doubleSlopeIRMConfig.name],
    abi: doubleSlopeIRMArtifact.abi,
    functionName: 'JUMP_UTIL_E18',
    args: [],
  })
  const borrRateMultiplier = await client.publicClient.readContract({
    address: registry.irms![pool.doubleSlopeIRMConfig.name],
    abi: doubleSlopeIRMArtifact.abi,
    functionName: 'BORR_RATE_MULTIPLIER_E18',
    args: [],
  })
  const jumpMultiplier = await client.publicClient.readContract({
    address: registry.irms![pool.doubleSlopeIRMConfig.name],
    abi: doubleSlopeIRMArtifact.abi,
    functionName: 'JUMP_MULTIPLIER_E18',
    args: [],
  })

  // validate
  expect(borrRateMultiplier).toStrictEqual(pool.doubleSlopeIRMConfig.params.borrowRateMultiplierE18)
  expect(baseBorrowRate).toStrictEqual(pool.doubleSlopeIRMConfig.params.baseBorrowRateE18)
  expect(jumpUtil).toStrictEqual(pool.doubleSlopeIRMConfig.params.jumpUtilizationRateE18)
  expect(jumpMultiplier).toStrictEqual(pool.doubleSlopeIRMConfig.params.jumpRateMultiplierE18)
}
