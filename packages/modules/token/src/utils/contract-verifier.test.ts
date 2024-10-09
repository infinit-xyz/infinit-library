import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { TokenRegistry, TokenType } from '../type'
import { TokenContractVerifier } from './contract-verifier'

// Create a subclass to expose the protected method for testing
class TestTokenContractVerifier extends TokenContractVerifier {
  public async testGetContracts(registry: TokenRegistry) {
    return this.getContracts(registry)
  }
}

describe('TokenContractVerifier.ts', () => {
  const registry: TokenRegistry = {
    tokens: {
      '0x86ce7353a19a6dbdb0a0ac01536ffc60f704980e': {
        type: TokenType.InfinitERC20,
      },
      '0x445aa85126dd02145e194e31b19ebac0d051e4e2': {
        type: TokenType.InfinitERC20Burnable,
      },
    },
    accumulativeMerkleDistributors: {
      '0xab7819826b1acd87e30fa45e359e4038683365e6': {
        implementation: '0x78bb7fd5fc49a644f7b07e43812ef9535fbcfd29',
      },
      '0x63743aaf4522ad8c47ba84b2fd2f645710b4454a': {
        implementation: '0x56313c36ba155bab1a5d569f48eaa965e270399d',
      },
    },
  }

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
