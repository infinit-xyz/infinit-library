import { Address, encodeFunctionData, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet, TransactionData } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployUniswapV3Action } from '@actions/deployUniswapV3'
import { DeployUniswapV3StakerAction } from '@actions/deployUniswapV3Staker'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet, getForkRpcUrl } from '@infinit-xyz/test'

export const setupUniswapV3 = async (): Promise<UniswapV3Registry> => {
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))
  const deployer = client.walletClient.account.address
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt

  const deployUniswapV3Action = new DeployUniswapV3Action({
    params: {
      nativeCurrencyLabel: 'ETH',
      proxyAdminOwner: deployer,
      factoryOwner: deployer,
      wrappedNativeToken: weth,
      uniswapV2Factory: zeroAddress,
    },
    signer: {
      deployer: client,
    },
  })

  let curRegistry = await deployUniswapV3Action.run({})
  // deploy staker
  const deployUniswapV3StakerAction = new DeployUniswapV3StakerAction({
    params: {
      factory: curRegistry.uniswapV3Factory!,
      nonfungiblePositionManager: curRegistry.nonfungiblePositionManager!,
      maxIncentiveStartLeadTime: 2592000n,
      maxIncentiveDuration: 63072000n,
    },
    signer: {
      deployer: client,
    },
  })
  curRegistry = await deployUniswapV3StakerAction.run(curRegistry)

  const erc20Artifact = await readArtifact('@openzeppelin/contracts-3.4.2-solc-0.7/token/ERC20/IERC20.sol:IERC20')
  const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
  const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
  const nonfungiblePositionManagerArtifact = await readArtifact('NonfungiblePositionManager')

  // mint token
  await client.sendTransactions([
    {
      name: 'mint WETH',
      txData: {
        to: weth,
        value: BigInt(20 * 10 ** 18),
      },
    },
  ])

  // transfer 100 wei to the client
  const transferData = encodeFunctionData({
    abi: erc20Artifact.abi,
    functionName: 'transfer',
    args: [client.walletClient.account.address, BigInt(100_000 * 10 ** 6)],
  })
  const transferTx: TransactionData = {
    data: transferData,
    to: usdt,
  }
  const rich_man_client = new TestInfinitWallet(TestChain.arbitrum, '0xF977814e90dA44bFA03b6295A0616a897441aceC')
  await rich_man_client.sendTransactions([{ name: 'transfer', txData: transferTx }])
  // approve
  const approveNpmData = encodeFunctionData({
    abi: erc20Artifact.abi,
    functionName: 'approve',
    args: [curRegistry.nonfungiblePositionManager!, 115792089237316195423570985008687907853269984665640564039457584007913129639935n],
  })
  const approveSwapRouterData = encodeFunctionData({
    abi: erc20Artifact.abi,
    functionName: 'approve',
    args: [curRegistry.swapRouter02!, 115792089237316195423570985008687907853269984665640564039457584007913129639935n],
  })

  // create new pool
  const createPoolData = encodeFunctionData({
    abi: uniswapV3FactoryArtifact.abi,
    functionName: 'createPool',
    args: [weth, usdt, 500],
  })

  await client.sendTransactions([
    { name: 'approve USDT to NPM', txData: { data: approveNpmData, to: usdt } },
    { name: 'approve WETH to NPM', txData: { data: approveNpmData, to: weth } },
    { name: 'approve USDT to SwapRouter', txData: { data: approveSwapRouterData, to: usdt } },
    { name: 'approve WETH to SwapRouter', txData: { data: approveSwapRouterData, to: weth } },
    { name: 'Create new pool', txData: { data: createPoolData, to: curRegistry.uniswapV3Factory } },
  ])

  const poolAddress = await client.publicClient.readContract({
    address: curRegistry.uniswapV3Factory!,
    abi: uniswapV3FactoryArtifact.abi,
    functionName: 'getPool',
    args: [weth, usdt, 500],
  })

  const initializePoolData = encodeFunctionData({
    abi: uniswapV3PoolArtifact.abi,
    functionName: 'initialize',
    args: [3886124089039612594790876n],
  })

  const block1 = await client.publicClient.getBlock()
  console.log('block 1', block1.timestamp)

  await client.sendTransactions([
    {
      name: 'initialize pool',
      txData: { data: initializePoolData, to: poolAddress },
    },
  ])

  const block2 = await client.publicClient.getBlock()
  console.log('block 2', block2.timestamp)

  // add new position via npm
  const mintData = encodeFunctionData({
    abi: nonfungiblePositionManagerArtifact.abi,
    functionName: 'mint',
    args: [
      {
        token0: weth,
        token1: usdt,
        fee: 500,
        tickLower: -199000,
        tickUpper: -198000,
        amount0Desired: BigInt(10 * 10 ** 18),
        amount1Desired: BigInt(50_000 * 10 ** 6),
        amount0Min: 0n,
        amount1Min: 0n,
        recipient: client.walletClient.account.address,
        deadline: 115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      },
    ],
  })

  await client.sendTransactions([
    { name: 'Add new position via NPM', txData: { data: mintData, to: curRegistry.nonfungiblePositionManager! } },
  ])

  const block3 = await client.publicClient.getBlock()
  console.log('block 3', block3.timestamp)

  return curRegistry
}

export const swap = async (client: InfinitWallet, router: Address, tokenIn: Address, tokenOut: Address, fee: number, amountIn: bigint) => {
  const swapRouterArtifact = await readArtifact('SwapRouter02')

  const swapData = encodeFunctionData({
    abi: swapRouterArtifact.abi,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn,
        tokenOut,
        fee: fee,
        recipient: client.walletClient.account.address,
        amountIn,
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
      },
    ],
  })

  await client.sendTransactions([{ name: 'swap', txData: { data: swapData, to: router } }])
}

export const balanceOf = async (client: InfinitWallet, token: Address, owner: Address): Promise<bigint> => {
  const erc20Artifact = await readArtifact('@openzeppelin/contracts-3.4.1-solc-0.7-2/token/ERC20/IERC20.sol:IERC20')
  return await client.publicClient.readContract({
    address: token,
    abi: erc20Artifact.abi,
    functionName: 'balanceOf',
    args: [owner],
  })
}
