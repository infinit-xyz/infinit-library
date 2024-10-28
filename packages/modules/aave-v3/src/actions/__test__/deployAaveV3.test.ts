import { beforeAll, describe, expect, test } from 'vitest'

import { encodeFunctionData, maxUint256, parseEther, parseUnits, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAaveV3Action } from '@actions/deployAaveV3'
import { SupportNewReserveAction } from '@actions/supportNewReserve'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('deployAaveV3Action', () => {
  let action: DeployAaveV3Action
  let client: InfinitWallet
  let aliceClient: InfinitWallet

  const chainlinkEthFeeder = ARBITRUM_TEST_ADDRESSES.chainlinkEthFeeder
  // anvil tester pk
  const privateKey = ANVIL_PRIVATE_KEY
  const alicePk = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  const weth = ARBITRUM_TEST_ADDRESSES.weth
  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    const aliceAccount = privateKeyToAccount(alicePk)

    client = new TestInfinitWallet(TestChain.arbitrum, account.address)
    aliceClient = new TestInfinitWallet(TestChain.arbitrum, aliceAccount.address)
  })

  test('simple run (all roles are deployer)', async () => {
    const deployer = client.walletClient.account.address
    action = new DeployAaveV3Action({
      params: {
        treasuryOwner: deployer,
        addressesProviderRegistryOwner: deployer,
        addressesProviderOwner: deployer,
        wrappedTokenGatewayOwner: deployer,
        emissionManagerOwner: deployer,
        aclAdmin: deployer,
        fundsAdmin: deployer,
        poolAdmin: deployer,
        emergencyAdmin: deployer,
        rewardsAdmin: deployer,
        rewardsHolder: deployer,
        marketId: '0',
        flashloanPremiumsTotal: 0n,
        flashloanPremiumsProtocol: 0n,
        providerId: 36n,
        chainlinkAggProxy: chainlinkEthFeeder,
        chainlinkETHUSDAggProxy: chainlinkEthFeeder,

        assets: [],
        sources: [],
        fallbackOracle: zeroAddress,
        baseCurrency: zeroAddress,
        baseCurrencyUnit: 100_000_000n,
        wrappedNativeToken: weth,

        defaultReserveInterestRateStrategyConfigs: [
          {
            name: 'rateStrategyVolatileOne',
            params: {
              optimalUsageRatio: parseUnits('0.45', 27),
              baseVariableBorrowRate: 0n,
              variableRateSlope1: parseUnits('0.07', 27),
              variableRateSlope2: parseUnits('3', 27),
              stableRateSlope1: parseUnits('0.07', 27),
              stableRateSlope2: parseUnits('3', 27),
              baseStableRateOffset: parseUnits('0.02', 27),
              stableRateExcessOffset: parseUnits('0.05', 27),
              optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
            },
          },
        ],
      },
      signer: {
        deployer: client,
      },
    })
    const cureRegistry = await action.run({}, undefined, undefined)

    expect(cureRegistry.poolAddressProviderRegistry).not.toBe(zeroAddress)
    expect(cureRegistry.supplyLogic).not.toBe(zeroAddress)
    expect(cureRegistry.borrowLogic).not.toBe(zeroAddress)
    expect(cureRegistry.liquidationLogic).not.toBe(zeroAddress)
    expect(cureRegistry.eModeLogic).not.toBe(zeroAddress)
    expect(cureRegistry.bridgeLogic).not.toBe(zeroAddress)
    expect(cureRegistry.configuratorLogic).not.toBe(zeroAddress)
    expect(cureRegistry.poolLogic).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveV2Proxy).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveController).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveV2Impl).not.toBe(zeroAddress)
    expect(cureRegistry.poolAddressesProvider).not.toBe(zeroAddress)
    expect(cureRegistry.reservesSetupHelper).not.toBe(zeroAddress)
    expect(cureRegistry.walletBalanceProvider).not.toBe(zeroAddress)
    expect(cureRegistry.uiIncentiveDataProvider).not.toBe(zeroAddress)
    expect(cureRegistry.uiPoolDataProviderV3).not.toBe(zeroAddress)
    expect(cureRegistry.aaveProtocolDataProvider).not.toBe(zeroAddress)
    expect(cureRegistry.flashLoanLogic).not.toBe(zeroAddress)
    expect(cureRegistry.poolConfiguratorImpl).not.toBe(zeroAddress)
    expect(cureRegistry.aclManager).not.toBe(zeroAddress)
    expect(cureRegistry.aaveOracle).not.toBe(zeroAddress)
    expect(cureRegistry.l2PoolImpl).not.toBe(zeroAddress)
    expect(cureRegistry.poolProxy).not.toBe(zeroAddress)
    expect(cureRegistry.poolConfiguratorProxy).not.toBe(zeroAddress)
    expect(cureRegistry.wrappedTokenGatewayV3).not.toBe(zeroAddress)
    expect(cureRegistry.l2Encoder).not.toBe(zeroAddress)
    expect(cureRegistry.aTokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.delegationAwareATokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.stableDebtTokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.variableDebtTokenImpl).not.toBe(zeroAddress)
  })

  test('simple run (different addreses on each roles + no init reserves)', async () => {
    action = new DeployAaveV3Action({
      params: {
        treasuryOwner: oneAddress,
        addressesProviderRegistryOwner: oneAddress,
        addressesProviderOwner: oneAddress,
        wrappedTokenGatewayOwner: oneAddress,
        emissionManagerOwner: oneAddress,
        aclAdmin: aliceClient.walletClient.account.address,
        fundsAdmin: oneAddress,
        poolAdmin: oneAddress,
        emergencyAdmin: oneAddress,
        rewardsAdmin: oneAddress,
        rewardsHolder: TEST_ADDRESSES.bob,
        marketId: '0',
        flashloanPremiumsTotal: 0n,
        flashloanPremiumsProtocol: 0n,
        providerId: 36n,
        chainlinkAggProxy: chainlinkEthFeeder,
        chainlinkETHUSDAggProxy: chainlinkEthFeeder,

        assets: [],
        sources: [],
        fallbackOracle: zeroAddress,
        baseCurrency: zeroAddress,
        baseCurrencyUnit: 100_000_000n,
        wrappedNativeToken: weth,

        defaultReserveInterestRateStrategyConfigs: [
          {
            name: 'rateStrategyVolatileOne',
            params: {
              optimalUsageRatio: parseUnits('0.45', 27),
              baseVariableBorrowRate: 0n,
              variableRateSlope1: parseUnits('0.07', 27),
              variableRateSlope2: parseUnits('3', 27),
              stableRateSlope1: parseUnits('0.07', 27),
              stableRateSlope2: parseUnits('3', 27),
              baseStableRateOffset: parseUnits('0.02', 27),
              stableRateExcessOffset: parseUnits('0.05', 27),
              optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
            },
          },
        ],
      },
      signer: {
        deployer: client,
      },
    })
    const cureRegistry = await action.run({}, undefined, undefined)

    expect(cureRegistry.poolAddressProviderRegistry).not.toBe(zeroAddress)
    expect(cureRegistry.supplyLogic).not.toBe(zeroAddress)
    expect(cureRegistry.borrowLogic).not.toBe(zeroAddress)
    expect(cureRegistry.liquidationLogic).not.toBe(zeroAddress)
    expect(cureRegistry.eModeLogic).not.toBe(zeroAddress)
    expect(cureRegistry.bridgeLogic).not.toBe(zeroAddress)
    expect(cureRegistry.configuratorLogic).not.toBe(zeroAddress)
    expect(cureRegistry.poolLogic).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveV2Proxy).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveController).not.toBe(zeroAddress)
    expect(cureRegistry.aaveEcosystemReserveV2Impl).not.toBe(zeroAddress)
    expect(cureRegistry.poolAddressesProvider).not.toBe(zeroAddress)
    expect(cureRegistry.reservesSetupHelper).not.toBe(zeroAddress)
    expect(cureRegistry.walletBalanceProvider).not.toBe(zeroAddress)
    expect(cureRegistry.uiIncentiveDataProvider).not.toBe(zeroAddress)
    expect(cureRegistry.uiPoolDataProviderV3).not.toBe(zeroAddress)
    expect(cureRegistry.aaveProtocolDataProvider).not.toBe(zeroAddress)
    expect(cureRegistry.flashLoanLogic).not.toBe(zeroAddress)
    expect(cureRegistry.poolConfiguratorImpl).not.toBe(zeroAddress)
    expect(cureRegistry.aclManager).not.toBe(zeroAddress)
    expect(cureRegistry.aaveOracle).not.toBe(zeroAddress)
    expect(cureRegistry.l2PoolImpl).not.toBe(zeroAddress)
    expect(cureRegistry.poolProxy).not.toBe(zeroAddress)
    expect(cureRegistry.poolConfiguratorProxy).not.toBe(zeroAddress)
    expect(cureRegistry.wrappedTokenGatewayV3).not.toBe(zeroAddress)
    expect(cureRegistry.l2Encoder).not.toBe(zeroAddress)
    expect(cureRegistry.aTokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.delegationAwareATokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.stableDebtTokenImpl).not.toBe(zeroAddress)
    expect(cureRegistry.variableDebtTokenImpl).not.toBe(zeroAddress)

    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')
    const owner = await client.publicClient.readContract({
      address: cureRegistry.poolAddressesProvider!,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(owner).toBe(oneAddress)
  })

  test('simple run (different addreses on each roles) + init reserves', { retry: 5 }, async () => {
    const deployer = client.walletClient.account.address
    const weth9 = await readArtifact('WETH9')
    const callData = encodeFunctionData({ abi: weth9.abi, functionName: 'deposit', args: [] })
    const tx: TransactionData = {
      data: callData,
      to: weth,
      value: BigInt(10 ** 18),
    }

    await client.sendTransactions([{ name: 'Mint WETH', txData: tx }])

    action = new DeployAaveV3Action({
      params: {
        treasuryOwner: deployer,
        addressesProviderRegistryOwner: deployer,
        addressesProviderOwner: deployer,
        wrappedTokenGatewayOwner: deployer,
        emissionManagerOwner: deployer,
        aclAdmin: deployer,
        fundsAdmin: deployer,
        poolAdmin: deployer,
        emergencyAdmin: deployer,
        rewardsAdmin: deployer,
        rewardsHolder: deployer,
        marketId: '0',
        flashloanPremiumsTotal: 0n,
        flashloanPremiumsProtocol: 0n,
        providerId: 36n,
        chainlinkAggProxy: chainlinkEthFeeder,
        chainlinkETHUSDAggProxy: chainlinkEthFeeder,

        assets: [],
        sources: [],
        fallbackOracle: zeroAddress,
        baseCurrency: zeroAddress,
        baseCurrencyUnit: 100_000_000n,
        wrappedNativeToken: weth,

        defaultReserveInterestRateStrategyConfigs: [
          {
            name: 'rateStrategyVolatileOne',
            params: {
              optimalUsageRatio: parseUnits('0.45', 27),
              baseVariableBorrowRate: 0n,
              variableRateSlope1: parseUnits('0.07', 27),
              variableRateSlope2: parseUnits('3', 27),
              stableRateSlope1: parseUnits('0.07', 27),
              stableRateSlope2: parseUnits('3', 27),
              baseStableRateOffset: parseUnits('0.02', 27),
              stableRateExcessOffset: parseUnits('0.05', 27),
              optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
            },
          },
        ],
      },
      signer: {
        deployer: client,
      },
    })
    const curRegistry = await action.run({}, undefined, undefined)

    const registryKeys: (keyof AaveV3Registry)[] = ['poolAddressProviderRegistry', 'supplyLogic']

    expect(registryKeys.every((key) => !!curRegistry[key])).toBe(true)

    expect(curRegistry.poolProxy).not.toBeUndefined()
    expect(curRegistry.reservesSetupHelper).not.toBeUndefined()
    expect(curRegistry.poolConfiguratorProxy).not.toBeUndefined()
    expect(curRegistry.aclManager).not.toBeUndefined()

    expect(curRegistry.poolProxy).not.toBe(zeroAddress)
    expect(curRegistry.reservesSetupHelper).not.toBe(zeroAddress)
    expect(curRegistry.poolConfiguratorProxy).not.toBe(zeroAddress)
    expect(curRegistry.aclManager).not.toBe(zeroAddress)

    const action2 = new SupportNewReserveAction({
      signer: {
        deployer: client,
        poolAdmin: client,
        aclAdmin: client,
      },
      params: {
        aclManager: curRegistry.aclManager!,
        pool: curRegistry.poolProxy!,
        reservesSetupHelper: curRegistry.reservesSetupHelper!,
        poolConfigurator: curRegistry.poolConfiguratorProxy!,
        oracle: curRegistry.aaveOracle!,
        setupReservesParams: [
          {
            aTokenImpl: curRegistry.aTokenImpl!,
            stableDebtTokenImpl: curRegistry.stableDebtTokenImpl!,
            variableDebtTokenImpl: curRegistry.variableDebtTokenImpl!,
            underlyingAssetDecimals: 18,
            interestRateStrategyAddress: curRegistry.reserveInterestRateStrategies!['rateStrategyVolatileOne']!,
            underlyingAsset: weth,
            treasury: curRegistry.aaveEcosystemReserveV2Proxy!,
            incentivesController: zeroAddress,
            aTokenName: 'eieize aToken',
            aTokenSymbol: 'EIEI',
            variableDebtTokenName: 'eieize aToken',
            variableDebtTokenSymbol: 'EIEI V',
            stableDebtTokenName: 'eieize aToken',
            stableDebtTokenSymbol: 'EIEI V',
            params: '0x10',
            asset: weth,
            baseLTV: 7000n,
            liquidationThreshold: 7100n,
            liquidationBonus: 11500n,
            reserveFactor: 2000n,
            borrowCap: 0n,
            supplyCap: 0n,
            stableBorrowingEnabled: false,
            borrowingEnabled: true,
            flashLoanEnabled: true,
            amount: 100n,
            onBehalfOf: client.walletClient.account.address,
            referalCode: 0,
            source: chainlinkEthFeeder,
          },
        ],
      },
    })
    const curRegistry2 = await action2.run(curRegistry, undefined, undefined)

    // test supply
    const poolArtifact = await readArtifact('Pool')

    // mint and approved WETH
    await aliceClient.sendTransactions([
      {
        name: 'Mint WETH',
        txData: {
          data: encodeFunctionData({ abi: weth9.abi, functionName: 'deposit', args: [] }),
          to: weth,
          value: parseEther('100'),
        },
      },
      {
        name: 'Approve WETH',
        txData: {
          data: encodeFunctionData({ abi: weth9.abi, functionName: 'approve', args: [curRegistry2.poolProxy!, maxUint256] }),
          to: weth,
        },
      },
    ])

    // supply to the pool
    await expect(
      aliceClient.sendTransactions([
        {
          name: 'Supply WETH',
          txData: {
            data: encodeFunctionData({
              abi: poolArtifact.abi,
              functionName: 'supply',
              args: [weth, parseEther('10'), aliceClient.walletClient.account.address, 0],
            }),
            to: curRegistry2.poolProxy,
          },
        },
      ]),
    ).resolves.not.toThrowError()

    // borrow from the pool
    await expect(
      aliceClient.sendTransactions([
        {
          name: 'Borrow WETH',
          txData: {
            data: encodeFunctionData({
              abi: poolArtifact.abi,
              functionName: 'borrow',
              args: [weth, parseEther('1'), BigInt(2), 0, aliceClient.walletClient.account.address],
            }),
            to: curRegistry2.poolProxy,
          },
        },
      ]),
    ).resolves.not.toThrowError()

    // repay to the pool
    await expect(
      aliceClient.sendTransactions([
        {
          name: 'Repay WETH',
          txData: {
            data: encodeFunctionData({
              abi: poolArtifact.abi,
              functionName: 'repay',
              args: [weth, parseEther('0.1'), BigInt(2), aliceClient.walletClient.account.address],
            }),
            to: curRegistry2.poolProxy,
          },
        },
      ]),
    ).resolves.not.toThrowError()

    const aliceBalBf = await aliceClient.publicClient.readContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })

    const withdrawAmount = parseEther('0.1')

    await aliceClient.sendTransactions([
      {
        name: 'Withdraw WETH',
        txData: {
          data: encodeFunctionData({
            abi: poolArtifact.abi,
            functionName: 'withdraw',
            args: [weth, withdrawAmount, aliceClient.walletClient.account.address],
          }),
          to: curRegistry2.poolProxy,
        },
      },
    ])

    const aliceBalAft = await aliceClient.publicClient.readContract({
      address: weth,
      abi: weth9.abi,
      functionName: 'balanceOf',
      args: [aliceClient.walletClient.account.address],
    })

    await expect(aliceBalBf + withdrawAmount).toBe(aliceBalAft)
  })
})
