import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { DeployApi3ProxyOracleReaderAction } from '@actions/deployApi3ProxyOracleReader'
import { SetApi3ProxyOracleReaderTokensInfoAction } from '@actions/setApi3ProxyOracleReaderTokensInfo'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('set tokenInfos on Api3ProxyOracleReader', () => {
  let action: any
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const usdt = ARBITRUM_TEST_ADDRESSES.usdt

  let registry: InitCapitalRegistry
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('deploy Api3ProxyOracleReader', async () => {
    action = new DeployApi3ProxyOracleReaderAction({
      params: {
        accessControlManager: registry.accessControlManager!,
        proxyAdmin: registry.proxyAdmin!,
      },
      signer: {
        deployer: client,
      },
    })
    registry = await action.run(registry, undefined, undefined)
    action = new SetApi3ProxyOracleReaderTokensInfoAction({
      params: {
        tokensInfo: [
          {
            token: weth,
            dataFeedProxy: '0xf624881ac131210716F7708C28403cCBe346cB73',
            maxStaleTime: 86400n,
          },
          {
            token: usdt,
            dataFeedProxy: '0x52e2b919AE123b49249283735e6Ef9F5a6e8FC7d',
            maxStaleTime: 86400n,
          },
        ],
      },
      signer: {
        governor: client2,
      },
    })
    await action.run(registry, undefined, undefined)

    // check price from api3ProxyOracleReaderProxy not zero
    const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')
    let price = await client.publicClient.readContract({
      address: registry.api3ProxyOracleReaderProxy!,
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'getPrice_e36',
      args: [weth],
    })
    expect(price).not.toBe(0n)
    price = await client.publicClient.readContract({
      address: registry.api3ProxyOracleReaderProxy!,
      abi: api3ProxyOracleReaderArtifact.abi,
      functionName: 'getPrice_e36',
      args: [usdt],
    })
    expect(price).not.toBe(0n)
  })
})
