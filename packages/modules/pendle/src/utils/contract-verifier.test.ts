import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { PendleRegistry } from '../type'
import { PendleContractVerifier } from './contract-verifier'

// Create a subclass to expose the protected method for testing
class TestPendleContractVerifier extends PendleContractVerifier {
  public async testGetContracts(registry: PendleRegistry) {
    return this.getContracts(registry)
  }
}

describe('TokenContractVerifier.ts', () => {
  const registry: PendleRegistry = {}

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestPendleContractVerifier(
      createPublicClient({
        chain: holesky,
        transport: http('https://1rpc.io/holesky'),
      }),
      {
        apiKey: process.env.HOLESKY_ETHERSCAN_API_KEY ?? '',
        apiUrl: 'https://api-holesky.etherscan.io/api',
        url: 'https://holesky.etherscan.io',
      },
    )
    expect(verifier.testGetContracts(registry)).resolves.toMatchSnapshot()
  })
})
