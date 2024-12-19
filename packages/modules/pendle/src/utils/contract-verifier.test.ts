import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { PendleV3Registry } from '../type'
import { TokenContractVerifier } from './contract-verifier'

// Create a subclass to expose the protected method for testing
class TestTokenContractVerifier extends TokenContractVerifier {
  public async testGetContracts(registry: PendleV3Registry) {
    return this.getContracts(registry)
  }
}

describe('TokenContractVerifier.ts', () => {
  const registry: PendleV3Registry = {}

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestTokenContractVerifier(
      await createPublicClient({
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
