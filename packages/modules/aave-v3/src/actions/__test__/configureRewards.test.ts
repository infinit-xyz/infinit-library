import { beforeAll, describe, expect, test, vi } from 'vitest'

import { Address, encodeFunctionData, maxUint256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupAaveV3 } from '@actions/__mock__/setup'
import { ConfigRewardsAction } from '@actions/configureRewards'
import { SetEmissionAdminAction } from '@actions/setEmissionAdmin'

import { AaveV3Registry } from '@/src/type'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

vi.mock('@actions/subactions/setLtvSubAction')

describe('ConfigureRewardsAction', () => {
  let action: SetEmissionAdminAction
  let client: TestInfinitWallet
  let registry: AaveV3Registry
  let emissionManager: Address
  let aliceClient: InfinitWallet

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const claimerPk = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)

    registry = await setupAaveV3()
    const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
    const aliceAccount = privateKeyToAccount(claimerPk)

    emissionManager = registry.emissionManager!
    aliceClient = new InfinitWallet(arbitrum, rpcEndpoint, aliceAccount)
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
            distributionEnd: 1729853192,
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
    const weth9 = await readArtifact('WETH9')

    const poolArtifact = await readArtifact('Pool')
    await aliceClient.walletClient.writeContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'deposit',
      args: [],
      value: BigInt(10 ** 18),
    })
    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.walletClient.writeContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'approve',
      args: [registry.poolProxy!, maxUint256],
    })
    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.walletClient.writeContract({
      address: registry.poolProxy!,
      abi: poolArtifact.abi,
      functionName: 'supply',
      args: [weth, BigInt(10 ** 17), aliceClient.walletClient.account.address, 0],
    })
    const usdtArtifact = await readArtifact('IUsdt')
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

    const approveData = encodeFunctionData({
      abi: usdtArtifact.abi,
      functionName: 'approve',
      args: [registry.pullRewardsTransferStrategy!, maxUint256],
    })

    const approveTx: TransactionData = {
      data: approveData,
      to: ARBITRUM_TEST_ADDRESSES.usdt,
    }

    await usdtOwnerClient.sendTransactions([{ name: 'mint', txData: mintTx }])
    await client.sendTransactions([{ name: 'approve', txData: approveTx }])

    await client.testClient.increaseTime({ seconds: 10000 })
    const rewardsControllerArtifact = await readArtifact('RewardsController')

    const erc20Artifact = await readArtifact('IERC20')
    const aliceUsdtBalanceBf = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceBf).toBe(0n)

    await aliceClient.walletClient.writeContract({
      address: registry.rewardsControllerProxy!,
      abi: rewardsControllerArtifact.abi,
      functionName: 'claimAllRewardsToSelf',
      args: [[registry.lendingPools!.WETH.aToken]],
      // gas: 1000000n,
    })
    const aliceUsdtBalanceAft = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft).toBeGreaterThan(0n)

    await client.testClient.increaseTime({ seconds: 10000 })
    await aliceClient.walletClient.writeContract({
      address: registry.rewardsControllerProxy!,
      abi: rewardsControllerArtifact.abi,
      functionName: 'claimAllRewardsToSelf',
      args: [[registry.lendingPools!.WETH.aToken]],
      gas: 1000000n,
    })

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
            distributionEnd: 1729853192,
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

    const erc20Artifact = await readArtifact('IERC20')

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
    await aliceClient.walletClient.writeContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'deposit',
      args: [],
      value: BigInt(10 ** 18),
    })
    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.walletClient.writeContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'approve',
      args: [registry.poolProxy!, maxUint256],
    })
    await client.testClient.increaseTime({ seconds: 10000 })

    await aliceClient.walletClient.writeContract({
      address: registry.poolProxy!,
      abi: poolArtifact.abi,
      functionName: 'supply',
      args: [weth, BigInt(10 ** 17), aliceClient.walletClient.account.address, 0],
    })
    const usdtArtifact = await readArtifact('IUsdt')
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

    await aliceClient.walletClient.writeContract({
      address: registry.rewardsControllerProxy!,
      abi: rewardsControllerArtifact.abi,
      functionName: 'claimAllRewardsToSelf',
      args: [[registry.lendingPools!.WETH.aToken]],
      // gas: 1000000n,
    })
    const aliceUsdtBalanceAft = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft).toBeGreaterThan(0n)

    await client.testClient.increaseTime({ seconds: 10000 })
    await aliceClient.walletClient.writeContract({
      address: registry.rewardsControllerProxy!,
      abi: rewardsControllerArtifact.abi,
      functionName: 'claimAllRewardsToSelf',
      args: [[registry.lendingPools!.WETH.aToken]],
      gas: 1000000n,
    })

    const aliceUsdtBalanceAft2 = await aliceClient.publicClient.readContract({
      address: ARBITRUM_TEST_ADDRESSES.usdt,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })
    expect(aliceUsdtBalanceAft2).toBeGreaterThan(aliceUsdtBalanceAft)
  })
})
