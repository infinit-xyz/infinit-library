import { beforeAll, describe, expect, test } from 'vitest'

import { Address, decodeEventLog, encodeFunctionData, keccak256, toHex, zeroAddress } from 'viem'
import { Account, privateKeyToAccount } from 'viem/accounts'

import { TransactionData } from '@infinit-xyz/core'

import { PendleRegistry } from '../type'
import { ANVIL_PRIVATE_KEY } from './__mocks__/account'
import { ARBITRUM_TEST_ADDRESSES } from './__mocks__/address'
import { DeployPendleAction, DeployPendleParams } from './deployPendle'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('deployPendleAction', () => {
  let client: TestInfinitWallet
  let account: Account
  const bnAddress = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'

  beforeAll(() => {
    account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  })

  test('deployPendleAction', async () => {
    const params: DeployPendleParams = {
      refundAddress: bnAddress,
      lzEndpoint: bnAddress,
      governanceToken: bnAddress,
      initialApproxDestinationGas: 100000n,
      // using the parameters for the contractFactory referenced from https://basescan.org/tx/0x06d6e63b9e08be0e504375787193e674678d553c7a83546f8ee63d824c31f88a
      wrappedNativetoken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      feeRecipient: '0x0000000000000000000000000000000000000001',
      treasury: bnAddress,
      yieldContractFactory: {
        expiryDivisor: 86400n,
        interestFeeRate: 30000000000000000n,
        rewardFeeRate: 30000000000000000n,
      },
      rewardToken: ARBITRUM_TEST_ADDRESSES.pendle,
      guardian: bnAddress,
      marketContractFactory: {
        reserveFeePercent: 10,
      },
      blockCycleNumerator: 1000,
    }

    const action = new DeployPendleAction({
      params: params,
      signer: {
        deployer: client,
      },
    })

    // deploy
    let registry: PendleRegistry = {}
    registry = await action.run(registry)

    // validate
    checkRegistry(registry)
    checkRoles(client, registry, params)

    // test create yt from sy
    const ytFactoryArtifact = await readArtifact('PendleYieldContractFactory')
    const block = await client.publicClient.getBlock()
    let blockTimestamp = Number(block.timestamp) + 86400 * 60
    blockTimestamp = blockTimestamp - (blockTimestamp % 86400)
    const createYTData = encodeFunctionData({
      abi: ytFactoryArtifact.abi,
      functionName: 'createYieldContract',
      args: [ARBITRUM_TEST_ADDRESSES.syAUsdc, blockTimestamp, true],
    })
    const createYTTxData: TransactionData = {
      data: createYTData,
      to: registry.pendleYieldContractFactory!,
    }
    const txReceipts = await client.sendTransactions([
      {
        name: 'createYieldContract',
        txData: createYTTxData,
      },
    ])
    const txReceipt = txReceipts[0]
    // get pt and yt address from event
    const eventLog = decodeEventLog({
      abi: ytFactoryArtifact.abi,
      data: txReceipt.logs[1].data,
      topics: txReceipt.logs[1].topics,
    })
    const {
      PT: pt,
      YT: yt,
      SY: sy,
    } = eventLog.args as {
      SY: Address
      expiry: bigint
      PT: Address
      YT: Address
    }

    // todo: check yt's sy is same with real pendle yt's sy
    // read yt's SY
    const yieldTokenArtifact = await readArtifact('PendleYieldToken')
    const syFromYT = await client.publicClient.readContract({
      address: yt,
      abi: yieldTokenArtifact.abi,
      functionName: 'SY',
      args: [],
    })
    const expectedSy = await client.publicClient.readContract({
      address: '0xA1c32EF8d3c4c30cB596bAb8647e11daF0FA5C94',
      abi: yieldTokenArtifact.abi,
      functionName: 'SY',
      args: [],
    })
    expect(syFromYT).toBe(expectedSy)

    // use pt from create market
    const marketFactoryArtifact = await readArtifact('PendleMarketFactoryV3')
    const createMarketData = encodeFunctionData({
      abi: marketFactoryArtifact.abi,
      functionName: 'createNewMarket',
      args: [pt, 112567687675000000000n, 1029547938000000000n, 499875041000000n],
    })
    const createMarketTxData: TransactionData = {
      data: createMarketData,
      to: registry.pendleMarketFactoryV3!,
    }
    const txReceipts2 = await client.sendTransactions([
      {
        name: 'createNewMarket',
        txData: createMarketTxData,
      },
    ])
    const txReceipt2 = txReceipts2[0]
    const eventLog2 = decodeEventLog({
      abi: marketFactoryArtifact.abi,
      data: txReceipt2.logs[0].data,
      topics: txReceipt2.logs[0].topics,
    })
    let market: Address = zeroAddress
    if ('market' in eventLog2.args && 'PT' in eventLog2.args) {
      market = eventLog2.args.market
      expect(market).not.toBe(zeroAddress)
      expect(eventLog2.args.PT).toBe(pt)
    } else {
      throw new Error('Unexpected event log format')
    }
    // note: we will test market's functionalities in router tests
    // test router
    // rich guy approve usdc to router
    const richGuy = new TestInfinitWallet(TestChain.arbitrum, '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7')
    const netTokenIn = BigInt(1_000_000 * 10 ** 6)
    await ensureApprove(richGuy, ARBITRUM_TEST_ADDRESSES.usdc, registry.pendleRouterV4!, netTokenIn)
    // mint syFromToken
    let syBalanceBefore = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    const actionMiscV3Artifact = await readArtifact('ActionMiscV3')
    const mintSyData = encodeFunctionData({
      abi: actionMiscV3Artifact.abi,
      functionName: 'mintSyFromToken',
      args: [
        richGuy.impersonatedUser,
        sy,
        0n,
        {
          tokenIn: ARBITRUM_TEST_ADDRESSES.usdc,
          netTokenIn: netTokenIn,
          tokenMintSy: ARBITRUM_TEST_ADDRESSES.usdc,
          pendleSwap: zeroAddress,
          swapData: {
            swapType: 0,
            extRouter: zeroAddress,
            extCalldata: '0x',
            needScale: false,
          },
        },
      ],
    })
    const mintSyTxData: TransactionData = {
      data: mintSyData,
      to: registry.pendleRouterV4!,
    }
    await richGuy.sendTransactions([
      {
        name: 'mintSyFromToken',
        txData: mintSyTxData,
      },
    ])
    let syBalanceAfter = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    expect(syBalanceAfter).toBeGreaterThan(syBalanceBefore)
    // rich guy transfer half of sy to yt
    syBalanceBefore = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    let ytBalanceBefore = await balanceOf(richGuy, yt, richGuy.impersonatedUser)
    let ptBalanceBefore = await balanceOf(richGuy, pt, richGuy.impersonatedUser)
    const netSyIn = syBalanceAfter / 2n
    const transferSyData = encodeFunctionData({
      abi: yieldTokenArtifact.abi,
      functionName: 'transfer',
      args: [yt, netSyIn],
    })
    const transferSyTxData: TransactionData = {
      data: transferSyData,
      to: sy,
    }
    await richGuy.sendTransactions([
      {
        name: 'transfer',
        txData: transferSyTxData,
      },
    ])
    // rich guy mint yt pt
    const mintYtData = encodeFunctionData({
      abi: yieldTokenArtifact.abi,
      functionName: 'mintPY',
      args: [richGuy.impersonatedUser, richGuy.impersonatedUser],
    })
    const mintYtTxData: TransactionData = {
      data: mintYtData,
      to: yt,
    }
    await richGuy.sendTransactions([
      {
        name: 'mintPY',
        txData: mintYtTxData,
      },
    ])
    syBalanceAfter = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    let ytBalanceAfter = await balanceOf(richGuy, yt, richGuy.impersonatedUser)
    let ptBalanceAfter = await balanceOf(richGuy, pt, richGuy.impersonatedUser)
    expect(syBalanceAfter).toBe(syBalanceBefore - netSyIn)
    expect(ytBalanceAfter).toBeGreaterThan(ytBalanceBefore)
    expect(ptBalanceAfter).toBeGreaterThan(ptBalanceBefore)
    // rich guy approve pt & sy to router
    await ensureApprove(richGuy, pt, registry.pendleRouterV4!, ptBalanceAfter)
    await ensureApprove(richGuy, sy, registry.pendleRouterV4!, syBalanceAfter)
    const lpBalanceBefore = await balanceOf(richGuy, market, richGuy.impersonatedUser)
    // addLiquiditySingleSy
    const actionAddRemoveLiqV3Artifact = await readArtifact('ActionAddRemoveLiqV3')
    const addLiquidityDualSyAndPtData = encodeFunctionData({
      abi: actionAddRemoveLiqV3Artifact.abi,
      functionName: 'addLiquidityDualSyAndPt',
      args: [
        richGuy.impersonatedUser,
        market,
        syBalanceAfter / 2n,
        ptBalanceAfter / 2n,
        0n,
        // {
        //   guessMax: 0n,
        //   guessMin: 0n,
        //   guessOffchain: 0n,
        //   maxIteration: 0n,
        //   eps: 0n,
        // },
        // {
        //   limitRouter: zeroAddress,
        //   epsSkipMarket: 0n,
        //   normalFills: [],
        //   flashFills: [],
        //   optData: '0x'
        // }
      ],
    })
    const addLiquidityDualSyAndPtTxData: TransactionData = {
      data: addLiquidityDualSyAndPtData,
      to: registry.pendleRouterV4!,
    }
    await richGuy.sendTransactions([
      {
        name: 'addLiquidityDualSyAndPt',
        txData: addLiquidityDualSyAndPtTxData,
      },
    ])
    const lpBalanceAfter = await balanceOf(richGuy, market, richGuy.impersonatedUser)
    expect(lpBalanceAfter).toBeGreaterThan(lpBalanceBefore)
    ptBalanceBefore = await balanceOf(richGuy, pt, richGuy.impersonatedUser)
    syBalanceBefore = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    // swapExactPtForSy
    const actionSwapPTV3Artifact = await readArtifact('ActionSwapPTV3')
    const swapExactPtForSyData = encodeFunctionData({
      abi: actionSwapPTV3Artifact.abi,
      functionName: 'swapExactPtForSy',
      args: [
        richGuy.impersonatedUser,
        market,
        BigInt(1000 * 10 ** 6),
        0n,
        {
          limitRouter: zeroAddress,
          epsSkipMarket: 0n,
          normalFills: [],
          flashFills: [],
          optData: '0x',
        },
      ],
    })
    const swapExactPtForSyTxData: TransactionData = {
      data: swapExactPtForSyData,
      to: registry.pendleRouterV4!,
    }
    await richGuy.sendTransactions([
      {
        name: 'swapExactPtForSy',
        txData: swapExactPtForSyTxData,
      },
    ])
    ptBalanceAfter = await balanceOf(richGuy, pt, richGuy.impersonatedUser)
    syBalanceAfter = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    expect(ptBalanceAfter).toBeLessThan(ptBalanceBefore)
    expect(syBalanceAfter).toBeGreaterThan(syBalanceBefore)
    // swapExactPtForYt
    syBalanceBefore = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    ytBalanceBefore = await balanceOf(richGuy, yt, richGuy.impersonatedUser)
    const actionSwapYTV3Artifact = await readArtifact('ActionSwapYTV3')
    const swapExactPtForYtData = encodeFunctionData({
      abi: actionSwapYTV3Artifact.abi,
      functionName: 'swapExactSyForYt',
      args: [
        richGuy.impersonatedUser,
        market,
        BigInt(1000 * 10 ** 6),
        0n,
        {
          guessMax: 0n,
          guessMin: 0n,
          guessOffchain: 0n,
          maxIteration: 0n,
          eps: 0n,
        },
        {
          limitRouter: zeroAddress,
          epsSkipMarket: 0n,
          normalFills: [],
          flashFills: [],
          optData: '0x',
        },
      ],
    })
    const swapExactPtForYtTxData: TransactionData = {
      data: swapExactPtForYtData,
      to: registry.pendleRouterV4!,
    }
    await richGuy.sendTransactions([
      {
        name: 'swapExactSyForYt',
        txData: swapExactPtForYtTxData,
      },
    ])
    syBalanceAfter = await balanceOf(richGuy, sy, richGuy.impersonatedUser)
    ytBalanceAfter = await balanceOf(richGuy, yt, richGuy.impersonatedUser)
    expect(syBalanceAfter).toBeLessThan(syBalanceBefore)
    expect(ytBalanceAfter).toBeGreaterThan(ytBalanceBefore)
  })
})

// --- Validate Functions ---
const checkRoles = async (client: TestInfinitWallet, registry: PendleRegistry, params: DeployPendleParams) => {
  const [pendleGovernanceProxyArtifact, pendleGaugeControllerMainchainUpgArtifact] = await Promise.all([
    readArtifact('PendleGovernanceProxy'),
    readArtifact('PendleGaugeControllerMainchainUpg'),
  ])
  const DEFAULT_ADMIN = toHex(0x00, { size: 32 })
  const GUARDIAN = keccak256(toHex('GUARDIAN'))

  // check role default admin on PendleGovernanceProxy
  const hasRoleDefaultAdmin = await client.publicClient.readContract({
    address: registry.pendleGovernanceProxy!,
    abi: pendleGovernanceProxyArtifact.abi,
    functionName: 'hasRole',
    args: [DEFAULT_ADMIN, client.walletClient.account.address],
  })
  expect(hasRoleDefaultAdmin).toBe(true)

  // check role guardian on PendleGovernanceProxy
  const hasRoleGuardian = await client.publicClient.readContract({
    address: registry.pendleGovernanceProxy!,
    abi: pendleGovernanceProxyArtifact.abi,
    functionName: 'hasRole',
    args: [GUARDIAN, params.guardian],
  })
  expect(hasRoleGuardian).toBe(true)

  // check owner for PendleGaugeControllerMainchainUpgProxy should be guardian
  const pendleGaugeControllerMainchainUpgOwner = await client.publicClient.readContract({
    address: registry.pendleGaugeControllerMainchainUpgProxy!,
    abi: pendleGaugeControllerMainchainUpgArtifact.abi,
    functionName: 'owner',
    args: [],
  })
  expect(pendleGaugeControllerMainchainUpgOwner).toBe(params.guardian)
}

const checkRegistry = async (registry: PendleRegistry) => {
  expect(registry.baseSplitCodeFactoryContract).not.toBe(zeroAddress)
  expect(registry.oracleLib).not.toBe(zeroAddress)
  expect(registry.pendleGaugeControllerMainchainUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleMarketFactoryV3).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracle).not.toBe(zeroAddress)
  expect(registry.pendleSwap).not.toBe(zeroAddress)
  expect(registry.pendleYieldContractFactory).not.toBe(zeroAddress)
  expect(registry.votingEscrowPendleMainchain).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleMsgSendEndpointUpgProxy).not.toBe(zeroAddress)
  expect(registry.pendleVotingContollerUpgImpl).not.toBe(zeroAddress)
  expect(registry.pendleVotingControllerUpgProxy).not.toBe(zeroAddress)
  expect(registry.pendleGaugeControllerMainchainUpgProxy).not.toBe(zeroAddress)

  // check pendleRouterV4 facets
  expect(registry.routerStorageV4).not.toBe(zeroAddress)
  expect(registry.actionAddRemoveLiqV3).not.toBe(zeroAddress)
  expect(registry.actionCallbackV3).not.toBe(zeroAddress)
  expect(registry.actionMiscV3).not.toBe(zeroAddress)
  expect(registry.actionSimple).not.toBe(zeroAddress)
  expect(registry.actionSwapPTV3).not.toBe(zeroAddress)
  expect(registry.actionSwapYTV3).not.toBe(zeroAddress)

  expect(registry.pendleRouterV4).not.toBe(zeroAddress)

  // check pendleRouterStatic facets
  expect(registry.pendleRouterStatic).not.toBe(zeroAddress)
  expect(registry.actionStorageStatic).not.toBe(zeroAddress)
  expect(registry.actionInfoStatic).not.toBe(zeroAddress)
  expect(registry.actionMarketAuxStatic).not.toBe(zeroAddress)
  expect(registry.actionMarketCoreStatic).not.toBe(zeroAddress)
  expect(registry.actionMintRedeemStatic).not.toBe(zeroAddress)
  expect(registry.actionVePendleStatic).not.toBe(zeroAddress)

  expect(registry.proxyAdmin).not.toBe(zeroAddress)
  expect(registry.pendleLimitRouterImpl).not.toBe(zeroAddress)
  expect(registry.pendleLimitRouterProxy).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracle).not.toBe(zeroAddress)
  expect(registry.pendlePYLpOracleProxy).not.toBe(zeroAddress)

  // check off-chain
  expect(registry.pendleMulticallV2).not.toBe(zeroAddress)
  expect(registry.multicall).not.toBe(zeroAddress)
  expect(registry.simulateHelper).not.toBe(zeroAddress)
  expect(registry.supplyCapReader).not.toBe(zeroAddress)

  expect(registry.pendlePoolDeployHelper).not.toBe(zeroAddress)
  expect(registry.pendleGovernanceProxyImpl).not.toBe(zeroAddress)
  expect(registry.pendleGovernanceProxy).not.toBe(zeroAddress)
  expect(registry.pendleBoringOneracle).not.toBe(zeroAddress)
}

const ensureApprove = async (client: TestInfinitWallet, token: Address, spender: Address, amount: bigint) => {
  const erc20Artifact = await readArtifact('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20')
  const allowance = await client.publicClient.readContract({
    address: token,
    abi: erc20Artifact.abi,
    functionName: 'allowance',
    args: [client.walletClient.account.address, spender],
  })
  if (allowance < amount) {
    const approveData = encodeFunctionData({
      abi: erc20Artifact.abi,
      functionName: 'approve',
      args: [spender, amount],
    })
    const txData: TransactionData = {
      data: approveData,
      to: token,
    }
    await client.sendTransactions([{ name: 'approve', txData: txData }])
  }
}

const balanceOf = async (client: TestInfinitWallet, token: Address, account: Address) => {
  const erc20Artifact = await readArtifact('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20')
  const balance = await client.publicClient.readContract({
    address: token,
    abi: erc20Artifact.abi,
    functionName: 'balanceOf',
    args: [account],
  })
  return balance
}
