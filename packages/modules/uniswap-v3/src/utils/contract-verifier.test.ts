import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { UniswapV3Registry } from '../type'
import { UniswapV3ContractVerifier } from './contract-verifier'

// Create a subclass to expose the protected method for testing
class TestUniswapV3ContractVerifier extends UniswapV3ContractVerifier {
  public async testGetContracts(registry: UniswapV3Registry) {
    return this.getContracts(registry)
  }
}

describe('UniswapV3ContractVerifier.ts', () => {
  const registry: UniswapV3Registry = {
    uniswapV3Factory: '0x8f0c29795615148f30bd402876fa69cbf88a91d4',
    nftDescriptor: '0xd66d72c3e44037229d01cd28ec541c10d8989ff1',
    tickLens: '0xac80bb20b9f763de59557bb0d88936800da7620e',
    proxyAdmin: '0x9cd6a1f83e35f40910ae5b59d86e3eb03ca32d21',
    quoterV2: '0x90a15ed68e1bd5eb02d972de6dde6fa72b0ff3c7',
    nonfungibleTokenPositionDescriptorImpl: '0x318cedc9cd4ead794eb3ff09de67463a0a476425',
    nonfungibleTokenPositionDescriptor: '0x2ffa05a4e3a06b1cb3716e294a31bd10356cd2ac',
    nonfungiblePositionManager: '0xc421820a10be395d41a25873f45e27b5cea80dfe',
    swapRouter02: '0xee6188037ab4f10a071cfa549fde21dc415e78a3',
    uniswapV3Staker: '0xbfc8692eded1c443569c17e7e6618033d533931c',
    permit2: '0xfd1f634f6c4b8f7b63ed9b32e748a049b28e743f',
    unsupportedProtocol: '0xc09eec68cd04842b213507ad0e0acbfcce87316a',
    universalRouter: '0x6ab3a902b67f0caf98c4714557845840e9645a5c',
    pools: ['0x2135ea24a418c8312b302dfce8eb3897b4c68804'],
  }

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestUniswapV3ContractVerifier(
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
