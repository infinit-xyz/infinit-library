import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployApi3ProxyOracleReaderAction } from '@actions/deployApi3ProxyOracleReader'
import { DeployInitCapitalAction } from '@actions/deployInitCapital'
import { DeployLsdApi3ProxyOracleReaderAction } from '@actions/deployLsdApi3ProxyOracleReader'
import { DeployPythOracleReaderAction } from '@actions/deployPythOracleReader'
import { SupportNewPoolActionParams, SupportNewPoolsAction } from '@actions/supportNewPools'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

export const setupInitCapital = async (): Promise<InitCapitalRegistry> => {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
  const deployer = client.walletClient.account.address
  const accessControlManagerOwner = client2.walletClient.account.address
  const weth = ARBITRUM_TEST_ADDRESSES.weth

  let registry: InitCapitalRegistry

  // 1. deploy init capital
  const deployInitCapitalAction = new DeployInitCapitalAction({
    params: {
      proxyAdminOwner: accessControlManagerOwner,
      wrappedNativeToken: weth,
      posManagerNftName: 'Init Position',
      posManagerNftSymbol: 'inPOS',
      maxCollCount: 5,
      maxLiqIncentiveMultiplier: 100n,
      governor: accessControlManagerOwner,
      guardian: deployer,
      feeAdmin: accessControlManagerOwner,
      treasury: accessControlManagerOwner,
    },
    signer: {
      deployer: client,
      accessControlManagerOwner: client2,
    },
  })
  registry = await deployInitCapitalAction.run({})

  // 2. deploy api3 proxy oracle reader
  const deployApi3ProxyOracleReaderAction = new DeployApi3ProxyOracleReaderAction({
    params: {
      accessControlManager: registry.accessControlManager!,
      proxyAdmin: registry.proxyAdmin!,
    },
    signer: {
      deployer: client,
    },
  })
  registry = await deployApi3ProxyOracleReaderAction.run(registry)

  // 3. deploy pyth proxy oracle reader
  const deployPythOracleReaderAction = new DeployPythOracleReaderAction({
    params: {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
    },
    signer: {
      deployer: client,
    },
  })
  registry = await deployPythOracleReaderAction.run(registry)

  // 3. deploy lsd api3 proxy oracle reader
  const deployLsdApi3ProxyOracleReaderAction = new DeployLsdApi3ProxyOracleReaderAction({
    params: {},
    signer: {
      deployer: client,
    },
  })
  registry = await deployLsdApi3ProxyOracleReaderAction.run(registry)
  return registry
}

export const setupInitCapitalAndPools = async (): Promise<InitCapitalRegistry> => {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  let registry: InitCapitalRegistry = await setupInitCapital()

  // 4. deploy pools
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
    signer: { deployer: client, guardian: client, governor: client2 },
  })
  registry = await action.run(registry)
  return registry
}
