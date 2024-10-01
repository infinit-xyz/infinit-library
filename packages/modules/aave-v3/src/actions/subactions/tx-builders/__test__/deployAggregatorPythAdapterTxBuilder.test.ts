import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorPythAdapterTxBuilder } from '@actions/subactions/tx-builders/AggregatorPythAdapter/deploy'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY

// NOTE: test with Pyth on arbitrum
describe('DeployAggregatorPythAdapterTxBuilder', () => {
  let txBuilder: DeployAggregatorPythAdapterTxBuilder
  let client: InfinitWallet

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('successful validate deploy aggregator pyth adapter', async () => {
    txBuilder = new DeployAggregatorPythAdapterTxBuilder(client, {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
      priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('failed validate deploy aggregator pyth adapter pyth address', async () => {
    txBuilder = new DeployAggregatorPythAdapterTxBuilder(client, {
      pyth: zeroAddress,
      priceId: ARBITRUM_TEST_ADDRESSES.pythWethUsdPriceFeedId,
    })
    await expect(txBuilder.validate()).rejects.toThrowError('PYTH_CANNOT_BE_ZERO_ADDRESS')
  })

  test('failed validate deploy aggregator pyth adapter price id length', async () => {
    txBuilder = new DeployAggregatorPythAdapterTxBuilder(client, {
      pyth: ARBITRUM_TEST_ADDRESSES.pyth,
      priceId: '0x9d4294bbcd1',
    })
    await expect(txBuilder.validate()).rejects.toThrowError('PRICE_ID_IS_NOT_32_BYTES')
  })
})
