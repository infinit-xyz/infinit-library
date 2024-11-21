import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { DeployApi3ProxyOracleReaderAction } from '@actions/deployApi3ProxyOracleReader'
import { SetApi3ProxyOracleReaderTokensInfoAction } from '@actions/setApi3ProxyOracleReaderTokensInfo'
import { SetLsdApi3ProxyOracleReaderTokensInfoAction } from '@actions/setLsdApi3ProxyOracleReaderTokensInfo'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('set tokenInfos on Api3ProxyOracleReader', () => {
  let action: any
  const weth = ARBITRUM_TEST_ADDRESSES.weth
  const weeth = ARBITRUM_TEST_ADDRESSES.weeth

  let registry: InitCapitalRegistry
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('set lsdApi3ProxyOracleReader', async () => {
    // 1. set weth api3 proxy oracle reader
    action = new SetApi3ProxyOracleReaderTokensInfoAction({
      params: {
        api3ProxyOracleReader: registry.api3ProxyOracleReaderProxy!,
        tokensInfo: [
          {
            token: weth,
            dataFeedProxy: '0xf624881ac131210716F7708C28403cCBe346cB73',
            maxStaleTime: 86400n,
          },
        ],
      },
      signer: {
        governor: client2,
      },
    })
    registry = await action.run(registry, undefined, undefined)

    // 2. set weeth lsd api3 proxy oracle reader
    action = new SetLsdApi3ProxyOracleReaderTokensInfoAction({
      params: {
        lsdApi3ProxyOracleReader: registry.lsdApi3ProxyOracleReaderProxy!,
        tokensInfo: [
          {
            token: weeth,
            dataFeedProxy: '0x4Dab7dde07CCBfCfB19bc0537739490faa2ADB15',
            quoteToken: weth,
            maxStaleTime: 86400n,
          },
        ],
      },
      signer: {
        governor: client2,
      },
    })
    registry = await action.run(registry, undefined, undefined)

    // 3. check price from lsdApi3ProxyOracleReaderProxy not zero
    const lsdApi3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')
    const price = await client.publicClient.readContract({
      address: registry.lsdApi3ProxyOracleReaderProxy!,
      abi: lsdApi3ProxyOracleReaderArtifact.abi,
      functionName: 'getPrice_e36',
      args: [weeth],
    })
    expect(price).not.toBe(0n)
  })
})
