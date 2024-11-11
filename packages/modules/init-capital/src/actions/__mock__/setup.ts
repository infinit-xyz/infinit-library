import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployApi3ProxyOracleReaderAction } from '@actions/deployApi3ProxyOracleReader'
import { DeployInitCapitalAction } from '@actions/deployInitCapital'
import { DeployPythOracleReaderAction } from '@actions/deployPythOracleReader'

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
  // 3. deploy pyth oracle reader
  const deployPythOracleReaderAction = new DeployPythOracleReaderAction({
    params: {
      accessControlManager: registry.accessControlManager!,
      proxyAdmin: registry.proxyAdmin!,
      pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
    },
    signer: {
      deployer: client,
    },
  })
  registry = await deployPythOracleReaderAction.run(registry)

  // 3. deploy pyth proxy oracle reader
  const deployPythOracleReaderAction = new DeployPythOracleReaderAction({
    params: {
      accessControlManager: registry.accessControlManager!,
      proxyAdmin: registry.proxyAdmin!,
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
    },
    signer: {
      deployer: client,
    },
  })
  registry = await deployPythOracleReaderAction.run(registry)

  return registry
}
