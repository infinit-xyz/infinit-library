import { encodeFunctionData, parseUnits, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAaveV3Action } from '@actions/deployAaveV3'
import { SupportNewReserveAction } from '@actions/supportNewReserve'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

export const setupAaveV3 = async (): Promise<AaveV3Registry> => {
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))
  const deployer = client.walletClient.account.address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt

  const chainlinkEthFeeder = ARBITRUM_TEST_ADDRESSES.chainlinkEthFeeder
  const deployAaveV3Action = new DeployAaveV3Action({
    params: {
      treasuryOwner: deployer,
      addressesProviderRegistryOwner: deployer,
      addressesProviderOwner: deployer,
      wrappedTokenGatewayOwner: deployer,
      aclAdmin: deployer,
      fundsAdmin: deployer,
      poolAdmin: deployer,
      emergencyAdmin: deployer,
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

  const curRegistry = await deployAaveV3Action.run({})
  const weth9 = await readArtifact('WETH9')
  const callData = encodeFunctionData({ abi: weth9.abi, functionName: 'deposit', args: [] })
  const tx: TransactionData = {
    data: callData,
    to: weth,
    value: BigInt(10 ** 18),
  }
  await client.walletClient.sendTransaction({ ...tx, account: client.walletClient.account.address, chain: client.walletClient.chain })
  // note: there is no erc20mintable
  const usdtArtifact = await readArtifact('IERC20')
  // transfer 100 wei to the client
  const transferData = encodeFunctionData({
    abi: usdtArtifact.abi,
    functionName: 'transfer',
    args: [client.walletClient.account.address, BigInt(100)],
  })
  const transferTx: TransactionData = {
    data: transferData,
    to: usdt,
  }
  const rich_man_client = new TestInfinitWallet(TestChain.arbitrum, '0xF977814e90dA44bFA03b6295A0616a897441aceC')
  await rich_man_client.sendTransactions([{ name: 'transfer', txData: transferTx }])
  const supportNewReserveAction = new SupportNewReserveAction({
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
          aTokenName: 'WETH AToken',
          aTokenSymbol: 'aWETH',
          variableDebtTokenName: 'WETH VariableDebtToken',
          variableDebtTokenSymbol: 'vWETH',
          stableDebtTokenName: 'WETH StableDebtToken',
          stableDebtTokenSymbol: 'sWETH',
          params: '0x10',
          asset: weth,
          baseLTV: 8000n,
          liquidationThreshold: 9500n,
          liquidationBonus: 10050n,
          reserveFactor: 2000n,
          borrowCap: 0n,
          supplyCap: 100_000_000n,
          stableBorrowingEnabled: false,
          borrowingEnabled: false,
          flashLoanEnabled: false,
          amount: 100n,
          onBehalfOf: client.walletClient.account.address,
          referalCode: 0,
          source: chainlinkEthFeeder,
        },
        {
          aTokenImpl: curRegistry.aTokenImpl!,
          stableDebtTokenImpl: curRegistry.stableDebtTokenImpl!,
          variableDebtTokenImpl: curRegistry.variableDebtTokenImpl!,
          underlyingAssetDecimals: 6,
          interestRateStrategyAddress: curRegistry.reserveInterestRateStrategies!['rateStrategyVolatileOne']!,
          underlyingAsset: usdt,
          treasury: curRegistry.aaveEcosystemReserveV2Proxy!,
          incentivesController: zeroAddress,
          aTokenName: 'USDT AToken',
          aTokenSymbol: 'aUSDT',
          variableDebtTokenName: 'USDT VariableDebtToken',
          variableDebtTokenSymbol: 'vUSDT',
          stableDebtTokenName: 'USDT StableDebtToken',
          stableDebtTokenSymbol: 'sUSDT',
          params: '0x10',
          asset: usdt,
          baseLTV: 7000n,
          liquidationThreshold: 9500n,
          liquidationBonus: 10050n,
          reserveFactor: 2000n,
          borrowCap: 0n,
          supplyCap: 100_000_000n,
          stableBorrowingEnabled: false,
          borrowingEnabled: false,
          flashLoanEnabled: false,
          amount: 100n,
          onBehalfOf: client.walletClient.account.address,
          referalCode: 0,
          source: chainlinkEthFeeder,
        },
      ],
    },
  })
  return await supportNewReserveAction.run(curRegistry)
}
