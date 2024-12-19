import { afterAll, afterEach, beforeEach } from 'vitest'

import { Quantity } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

let snapshotId: Quantity

beforeEach(async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
  snapshotId = await client.testClient.snapshot()
})

afterEach(async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
  await client.testClient.revert({
    id: snapshotId,
  })
})

afterAll(async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, ARBITRUM_TEST_ADDRESSES.tester)
  await client.testClient.reset()
})
