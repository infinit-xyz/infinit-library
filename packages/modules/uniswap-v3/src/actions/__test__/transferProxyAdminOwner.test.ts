import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupUniswapV3 } from '@actions/__mock__/utils'
import { TransferProxyAdminOwnerAction } from '@actions/transferProxyAdminOwner'

import { UniswapV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

describe('transferProxyAdminOwnerAction', () => {
  let registry: UniswapV3Registry
  const client = new InfinitWallet(arbitrum, getForkRpcUrl(TestChain.arbitrum), privateKeyToAccount(ANVIL_PRIVATE_KEY))
  const oneAddress = ARBITRUM_TEST_ADDRESSES.oneAddress

  beforeAll(async () => {
    registry = await setupUniswapV3()
  })

  test('transferProxyAdminOwner to address(1)', async () => {
    const action = new TransferProxyAdminOwnerAction({
      params: {
        newOwner: oneAddress,
      },
      signer: {
        proxyAdminOwner: client,
      },
    })
    const newRegistry = await action.run(registry)
    expect(newRegistry).toStrictEqual(registry)
    // get proxyAdmin owner
    const proxyAdminArtifact = await readArtifact('ProxyAdmin')
    const proxyAdminOwner = await client.publicClient.readContract({
      address: registry.proxyAdmin!,
      abi: proxyAdminArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    expect(proxyAdminOwner).toBe(oneAddress)
  })
})
