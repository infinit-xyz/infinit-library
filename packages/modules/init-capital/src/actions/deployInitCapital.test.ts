import { beforeAll, describe, expect, test } from 'vitest'

import { keccak256, toHex, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployInitCapitalAction } from '@actions/deployInitCapital'
import { hasRole } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployInitCapitalAction', () => {
  let action: DeployInitCapitalAction
  let client: InfinitWallet
  let client2: InfinitWallet

  // anvil tester pk
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  beforeAll(() => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)

    client = new TestInfinitWallet(TestChain.arbitrum, account1.address)
    client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
  })

  test('deploy all', { retry: 3 }, async () => {
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
        feeAdmin: oneAddress,
        treasury: oneAddress,
      },
      signer: {
        deployer: client,
        accessControlManagerOwner: client2,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    expect(curRegistry.feeVault).not.toBe(zeroAddress)
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
    // check feeInfos of feeVault
    const feeVaultArtifact = await readArtifact('FeeVault')
    const feeInfos = await client.publicClient.readContract({
      address: curRegistry.feeVault!,
      abi: feeVaultArtifact.abi,
      functionName: 'getFeeInfos',
      args: [],
    })
    expect(feeInfos[0].admin).equal('0x0B5e09bffF17B7Ab0765dD077e69982Cd554C567')
    expect(feeInfos[0].treasury).equal('0x0B5e09bffF17B7Ab0765dD077e69982Cd554C567')
    expect(feeInfos[0].feeBps).equal(1000n)
    expect(feeInfos[1].admin).equal(oneAddress)
    expect(feeInfos[1].treasury).equal(oneAddress)
    expect(feeInfos[1].feeBps).equal(9000n)

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
