import { beforeAll, describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { FANTOM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployAggregatorBandAdapterTxBuilder } from '@actions/subactions/tx-builders/AggregatorBandAdapter/deploy'

import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'

const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)
// anvil tester pk
const privateKey = ANVIL_PRIVATE_KEY

// NOTE: test with Band on arbitrum
describe('DeployAggregatorBandAdapterTxBuilder', () => {
  let txBuilder: DeployAggregatorBandAdapterTxBuilder
  let client: InfinitWallet

  beforeAll(() => {
    const account = privateKeyToAccount(privateKey)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account)
  })

  test('successful validate deploy aggregator band adapter', async () => {
    txBuilder = new DeployAggregatorBandAdapterTxBuilder(client, {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      base: 'ETH',
      quote: 'USD',
    })
    await expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('failed validate deploy aggregator band adapter ref address', async () => {
    txBuilder = new DeployAggregatorBandAdapterTxBuilder(client, {
      ref: zeroAddress,
      base: 'ETH',
      quote: 'USD',
    })
    await expect(txBuilder.validate()).rejects.toThrowError('REF_CANNOT_BE_ZERO_ADDRESS')
  })

  test('failed validate deploy aggregator band adapter base string', async () => {
    txBuilder = new DeployAggregatorBandAdapterTxBuilder(client, {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      base: '',
      quote: 'USD',
    })
    await expect(txBuilder.validate()).rejects.toThrowError('BASE_CANNOT_BE_EMPTY')
  })

  test('failed validate deploy aggregator band adapter quote string', async () => {
    txBuilder = new DeployAggregatorBandAdapterTxBuilder(client, {
      ref: FANTOM_TEST_ADDRESSES.bandRef,
      base: 'ETH',
      quote: '',
    })
    await expect(txBuilder.validate()).rejects.toThrowError('QUOTE_CANNOT_BE_EMPTY')
  })
})
