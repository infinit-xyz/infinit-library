import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { DeployPythOracleReaderAction } from '@actions/deployPythOracleReader'
import { SetPythOracleReaderTokensInfoAction } from '@actions/setPythOracleReaderTokensInfo'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('set tokenInfos on PythOracleReader', () => {
  let action: any
  let client: InfinitWallet
  let client2: InfinitWallet

  // anvil rpc endpoint
  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt

  let registry: InitCapitalRegistry

  beforeAll(async () => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account1)
    client2 = new InfinitWallet(arbitrum, rpcEndpoint, account2)
    registry = await setupInitCapital()
  })

  test('deploy PythOracleReader', async () => {
    action = new DeployPythOracleReaderAction({
      params: {
        pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
      },
      signer: {
        deployer: client,
      },
    })
    registry = await action.run(registry, undefined, undefined)
    action = new SetPythOracleReaderTokensInfoAction({
      params: {
        tokensInfo: [
          {
            token: weth,
            priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
            maxStaleTime: 86400n,
          },
          {
            token: usdt,
            priceId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
            maxStaleTime: 86400n,
          },
        ],
      },
      signer: {
        governor: client2,
      },
    })
    await action.run(registry, undefined, undefined)

    // check price from pythOracleReaderProxy not zero
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')
    let price = await client.publicClient.readContract({
      address: registry.pythOracleReaderProxy!,
      abi: pythOracleReaderArtifact.abi,
      functionName: 'getPrice_e36',
      args: [weth],
    })
    expect(price).not.toBe(0n)
    price = await client.publicClient.readContract({
      address: registry.pythOracleReaderProxy!,
      abi: pythOracleReaderArtifact.abi,
      functionName: 'getPrice_e36',
      args: [usdt],
    })
    expect(price).not.toBe(0n)
  })
})
