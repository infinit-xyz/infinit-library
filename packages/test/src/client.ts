import { TestClient, createTestClient, http } from 'viem'

import { chains } from './chains.js'
import { TestChain } from './constants.js'
import { getForkRpcUrl } from 'packages/test/src/utils.js'

const arbitrumTestClient = createTestClient({
  mode: 'anvil',
  chain: chains.arbitrum,
  transport: http(getForkRpcUrl(TestChain.arbitrum), { timeout: 60_000 }),
})

const fantomTestClient = createTestClient({
  mode: 'anvil',
  chain: chains.fantom,
  transport: http(getForkRpcUrl(TestChain.fantom), { timeout: 60_000 }),
})

export const testClients: Record<TestChain, TestClient> = {
  [TestChain.arbitrum]: arbitrumTestClient,
  [TestChain.fantom]: fantomTestClient,
}
