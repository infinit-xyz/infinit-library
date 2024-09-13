import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { DeployUniversalRouterAction } from '@actions/deployUniversalRouter'

import { UniswapV3Registry } from '@/src/type'
import { TestChain, getForkRpcUrl } from '@infinit/test'

describe('deployUniversalRouterAction', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))

  beforeAll(async () => {
    registry = await setupUniswapV3()
  })

  test('deploy universal router', async () => {
    const action = new DeployUniversalRouterAction({
      params: {
        wrappedNativeToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        seaportV1_5: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
        seaportV1_4: '0x00000000000001ad428e4906aE43D8F9852d0dD6',
        openseaConduit: '0x1E0049783F008A0085193E00003D00cd54003c71',
        nftxZap: '0x3BD7512966CbC3406962f8877edbE80aea8A2904',
        v2Factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
        v3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        pairInitCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        poolInitCodeHash: '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54',
      },
      signer: {
        deployer: client,
      },
    })
    registry = await action.run(registry)
    expect(registry.universalRouter).toBeDefined()
  })
})
