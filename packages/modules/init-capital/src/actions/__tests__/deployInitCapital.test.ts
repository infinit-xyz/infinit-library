import { beforeAll, describe, expect, test } from 'vitest'

import { keccak256, toHex, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployInitCapitalAction } from '@actions/deployInitCapital'
import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('deployInitCapitalAction', () => {
  let action: DeployInitCapitalAction
  let client: InfinitWallet
  let client2: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
    client2 = new InfinitWallet(arbitrum, rpcEndpoint, privateKeyToAccount(ANVIL_PRIVATE_KEY_2))
  })

  test('deploy all', async () => {
    action = new DeployInitCapitalAction({
      params: {
        proxyAdminOwner: oneAddress,
        wrappedNativeToken: weth,
        posManagerNftName: 'Init Position',
        posManagerNftSymbol: 'inPOS',
        maxCollCount: 5,
        maxLiqIncentiveMultiplier: 100n,
        governor: oneAddress,
        guardian: oneAddress,
      },
      signer: {
        deployer: client,
        accessControlManagerOwner: client2,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    expect(curRegistry.proxyAdmin).not.toBe(zeroAddress)
    expect(curRegistry.accessControlManager).not.toBe(zeroAddress)
    expect(curRegistry.initOracleProxy).not.toBe(zeroAddress)
    expect(curRegistry.configProxy).not.toBe(zeroAddress)
    expect(curRegistry.liqIncentiveCalculatorProxy).not.toBe(zeroAddress)
    expect(curRegistry.posManagerProxy).not.toBe(zeroAddress)
    expect(curRegistry.initCoreProxy).not.toBe(zeroAddress)
    expect(curRegistry.riskManagerProxy).not.toBe(zeroAddress)
    expect(curRegistry.moneyMarketHookProxy).not.toBe(zeroAddress)
    expect(curRegistry.initLens).not.toBe(zeroAddress)
    expect(curRegistry.initOracleImpl).not.toBe(zeroAddress)
    expect(curRegistry.configImpl).not.toBe(zeroAddress)
    expect(curRegistry.liqIncentiveCalculatorImpl).not.toBe(zeroAddress)
    expect(curRegistry.posManagerImpl).not.toBe(zeroAddress)
    expect(curRegistry.initCoreImpl).not.toBe(zeroAddress)
    expect(curRegistry.riskManagerImpl).not.toBe(zeroAddress)
    expect(curRegistry.moneyMarketHookImpl).not.toBe(zeroAddress)
    expect(curRegistry.lendingPoolImpl).not.toBe(zeroAddress)
    // check AccessControlManager owner
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const accessControlManagerOwner = await client.publicClient.readContract({
      address: curRegistry.accessControlManager!,
      abi: accessControlManagerArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(accessControlManagerOwner).toBe(client2.walletClient.account.address)
    // check ProxyAdmin owner
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')
    const proxyAdminOwner = await client.publicClient.readContract({
      address: curRegistry.proxyAdmin!,
      abi: proxyAdminArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(proxyAdminOwner).toBe(oneAddress)
    // check Governor role
    expect(
      hasRole(client, accessControlManagerArtifact, curRegistry.accessControlManager!, keccak256(toHex('governor')), oneAddress),
    ).resolves.toBeTruthy()
    // check Guardian role
    expect(
      hasRole(client, accessControlManagerArtifact, curRegistry.accessControlManager!, keccak256(toHex('guardian')), oneAddress),
    ).resolves.toBeTruthy()
  })
})
