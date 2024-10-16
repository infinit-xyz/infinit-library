import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployApi3AdapterTxBuilder } from '@actions/subactions/tx-builders/Api3Adapter/deploy'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY

// NOTE: test with Api3 on arbitrum
describe('DeployApi3AdapterTxBuilder', () => {
  let txBuilder: DeployApi3AdapterTxBuilder
  let client: InfinitWallet

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('successful validate deploy api3 adapter', async () => {
    txBuilder = new DeployApi3AdapterTxBuilder(client, {
      dataFeedProxy: ARBITRUM_TEST_ADDRESSES.api3EthUsdDapiProxy,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('failed validate deploy api3 adapter', async () => {
    txBuilder = new DeployApi3AdapterTxBuilder(client, {
      dataFeedProxy: zeroAddress,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('DATA_FEED_PROXY_CANNOT_BE_ZERO_ADDRESS')
  })
})
