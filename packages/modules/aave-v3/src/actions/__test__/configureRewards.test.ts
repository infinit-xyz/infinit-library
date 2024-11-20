import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, encodeFunctionData, maxUint256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { TransactionData } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { ConfigRewardsAction } from '@actions/configureRewards'
import { SetEmissionAdminAction } from '@actions/setEmissionAdmin'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

vi.mock('@actions/subactions/setLtvSubAction')

const DISTRIBUTION_END_UNIX_TIMESTAMP = Math.floor(Date.now() / 1_000 + 1_000_000)

describe('ConfigureRewardsAction', () => {
  let action: SetEmissionAdminAction
  let client: TestInfinitWallet
  let registry: AaveV3Registry
  let emissionManager: Address
  let aliceClient: TestInfinitWallet

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const claimerPk = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)

    registry = await setupAaveV3()

    const aliceAccount = privateKeyToAccount(claimerPk)

    emissionManager = registry.emissionManager!
    aliceClient = new TestInfinitWallet(TestChain.arbitrum, aliceAccount.address)
  })

  test('should run successfully', async () => {
    action = new SetEmissionAdminAction({
      params: {
        emissionManager: emissionManager,
        reward: ARBITRUM_TEST_ADDRESSES.usdt,
        admin: ARBITRUM_TEST_ADDRESSES.tester,
      },
      signer: {
        emissionManagerOwner: client,
      },
    })
    registry = await action.run(registry)

    const configRewardsAction = new ConfigRewardsAction({
      params: {
        emissionManager: registry.emissionManager!,
        rewardsConfigInputs: [
          {
            emissionPerSecond: 10_000n,
            totalSupply: 0n,
            distributionEnd: DISTRIBUTION_END_UNIX_TIMESTAMP,
            asset: registry.lendingPools!.WETH.aToken,
            reward: ARBITRUM_TEST_ADDRESSES.usdt,
            transferStrategy: registry.pullRewardsTransferStrategy!,
            rewardOracle: ARBITRUM_TEST_ADDRESSES.chainlinkEthFeeder,
          },
        ],
        approveParams: [],
      },
      signer: {
        emissionAdmin: client,
        rewardsHolder: client,
      },
    })
    await configRewardsAction.run(registry)

    // test user claim rewards
    const [weth9, poolArtifact, usdtArtifact, rewardsControllerArtifact, erc20Artifact] = await Promise.all([
      readArtifact('WETH9'),
      readArtifact('Pool'),
      readArtifact('IArbitrumERC20'),
      readArtifact('RewardsController'),
      readArtifact('aave-v3-core/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20'),
    ])

    await aliceClient.sendTransactions([
      {
        name: 'deposit',
        txData: {
          to: weth,
          value: BigInt(10 ** 18),
          data: encodeFunctionData({
            abi: weth9.abi,
            functionName: 'deposit',
            args: [],
          }),
        },
      },
    ])

    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.sendTransactions([
      {
        name: 'approve',
        txData: {
          to: weth,
          data: encodeFunctionData({
            abi: weth9.abi,
            functionName: 'approve',
            args: [registry.poolProxy!, maxUint256],
          }),
        },
      },
    ])

    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.sendTransactions([
      {
        name: 'supply',
        txData: {
          to: registry.poolProxy!,
          data: encodeFunctionData({
            abi: poolArtifact.abi,
            functionName: 'supply',
            args: [weth, BigInt(10 ** 17), aliceClient.walletClient.account.address, 0],
          }),
        },
      },
    ])

    const usdtOwner = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: usdtArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    const mintData = encodeFunctionData({
      abi: usdtArtifact.abi,
      functionName: 'mint',
      args: [client.walletClient.account.address, BigInt(10 ** 10)],
    })
    const mintTx: TransactionData = {
      data: mintData,
      to: ARBITRUM_TEST_ADDRESSES.usdt,
    }

    const usdtOwnerClient = new TestInfinitWallet(TestChain.arbitrum, usdtOwner)
    await usdtOwnerClient.sendTransactions([{ name: 'mint', txData: mintTx }])

    const approveData = encodeFunctionData({
      abi: usdtArtifact.abi,
      functionName: 'approve',
      args: [registry.pullRewardsTransferStrategy!, maxUint256],
    })

    const approveTx: TransactionData = {
      data: approveData,
      to: ARBITRUM_TEST_ADDRESSES.usdt,
    }

    await client.sendTransactions([{ name: 'approve', txData: approveTx }])

    await client.testClient.increaseTime({ seconds: 10000 })

    const aliceUsdtBalanceBf = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceBf).toBe(0n)

    // claim rewards 1st time
    await aliceClient.sendTransactions([
      {
        name: 'claimAllRewardsToSelf',
        txData: {
          to: registry.rewardsControllerProxy!,
          data: encodeFunctionData({
            abi: rewardsControllerArtifact.abi,
            functionName: 'claimAllRewardsToSelf',
            args: [[registry.lendingPools!.WETH.aToken]],
          }),
        },
      },
    ])

    const aliceUsdtBalanceAft = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft).toBeGreaterThan(0n)

    await client.testClient.increaseTime({ seconds: 10000 })

    // claim rewards 2nd time
    await aliceClient.sendTransactions([
      {
        name: 'claimAllRewardsToSelf',
        txData: {
          to: registry.rewardsControllerProxy!,
          data: encodeFunctionData({
            abi: rewardsControllerArtifact.abi,
            functionName: 'claimAllRewardsToSelf',
            args: [[registry.lendingPools!.WETH.aToken]],
          }),
        },
      },
    ])

    const aliceUsdtBalanceAft2 = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft2).toBeGreaterThan(aliceUsdtBalanceAft)
  })

  test('test approve', async () => {
    action = new SetEmissionAdminAction({
      params: {
        emissionManager: emissionManager,
        reward: ARBITRUM_TEST_ADDRESSES.usdt,
        admin: ARBITRUM_TEST_ADDRESSES.tester,
      },
      signer: {
        emissionManagerOwner: client,
      },
    })
    registry = await action.run(registry)

    const configRewardsAction = new ConfigRewardsAction({
      params: {
        emissionManager: registry.emissionManager!,
        rewardsConfigInputs: [
          {
            emissionPerSecond: 10_000n,
            totalSupply: 0n,
            distributionEnd: DISTRIBUTION_END_UNIX_TIMESTAMP,
            asset: registry.lendingPools!.WETH.aToken,
            reward: ARBITRUM_TEST_ADDRESSES.usdt,
            transferStrategy: registry.pullRewardsTransferStrategy!,
            rewardOracle: ARBITRUM_TEST_ADDRESSES.chainlinkEthFeeder,
          },
        ],
        approveParams: [
          {
            token: weth,
            spender: registry.pullRewardsTransferStrategy!,
            amount: maxUint256,
          },
          {
            token: ARBITRUM_TEST_ADDRESSES.usdt,
            spender: registry.pullRewardsTransferStrategy!,
            amount: maxUint256,
          },
        ],
      },
      signer: {
        emissionAdmin: client,
        rewardsHolder: client,
      },
    })
    await configRewardsAction.run(registry)

    const erc20Artifact = await readArtifact('aave-v3-core/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20')

    const wethAllowance = await client.publicClient.readContract({
      address: weth,
      abi: erc20Artifact.abi,
      functionName: 'allowance',
      args: [client.walletClient.account.address, registry.pullRewardsTransferStrategy!],
    })
    expect(wethAllowance).toBe(maxUint256)
    const usdtAllowance = await client.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'allowance',
      args: [client.walletClient.account.address, registry.pullRewardsTransferStrategy!],
    })
    expect(usdtAllowance).toBe(maxUint256)
    // test user claim rewards
    const weth9 = await readArtifact('WETH9')
    const poolArtifact = await readArtifact('Pool')
    const usdtArtifact = await readArtifact('IArbitrumERC20')

    await aliceClient.sendTransactions([
      {
        name: 'approve WETH',
        txData: {
          to: weth,
          data: encodeFunctionData({
            abi: weth9.abi,
            functionName: 'approve',
            args: [registry.poolProxy!, maxUint256],
          }),
        },
      },
      {
        name: 'deposit',
        txData: {
          to: weth,
          value: BigInt(10 ** 18),
          data: encodeFunctionData({
            abi: weth9.abi,
            functionName: 'deposit',
            args: [],
          }),
        },
      },
    ])

    await client.testClient.increaseTime({ seconds: 20000 })

    await aliceClient.sendTransactions([
      {
        name: 'supply WETH',
        txData: {
          to: registry.poolProxy!,
          data: encodeFunctionData({
            abi: poolArtifact.abi,
            functionName: 'supply',
            args: [weth, BigInt(10 ** 17), aliceClient.walletClient.account.address, 0],
          }),
        },
      },
    ])

    const usdtOwner = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: usdtArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    const usdtOwnerClient = new TestInfinitWallet(TestChain.arbitrum, usdtOwner)

    const mintData = encodeFunctionData({
      abi: usdtArtifact.abi,
      functionName: 'mint',
      args: [client.walletClient.account.address, BigInt(10 ** 10)],
    })
    const mintTx: TransactionData = {
      data: mintData,
      to: ARBITRUM_TEST_ADDRESSES.usdt,
    }

    await usdtOwnerClient.sendTransactions([{ name: 'mint', txData: mintTx }])

    await client.testClient.increaseTime({ seconds: 10000 })
    const rewardsControllerArtifact = await readArtifact('RewardsController')

    const aliceUsdtBalanceBf = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceBf).toBe(0n)

    await aliceClient.sendTransactions([
      {
        name: 'claimAllRewardsToSelf',
        txData: {
          to: registry.rewardsControllerProxy!,
          data: encodeFunctionData({
            abi: rewardsControllerArtifact.abi,
            functionName: 'claimAllRewardsToSelf',
            args: [[registry.lendingPools!.WETH.aToken]],
          }),
        },
      },
    ])
    const aliceUsdtBalanceAft = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft).toBeGreaterThan(0n)

    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.sendTransactions([
      {
        name: 'claimAllRewardsToSelf',
        txData: {
          to: registry.rewardsControllerProxy!,
          data: encodeFunctionData({
            abi: rewardsControllerArtifact.abi,
            functionName: 'claimAllRewardsToSelf',
            args: [[registry.lendingPools!.WETH.aToken]],
          }),
        },
      },
    ])

    const aliceUsdtBalanceAft2 = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft2).toBeGreaterThan(aliceUsdtBalanceAft)
  })
})
