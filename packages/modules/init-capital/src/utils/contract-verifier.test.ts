import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { InitCapitalContractVerifier } from './contract-verifier'
import { InitCapitalRegistry } from '@/src/type'

// Create a subclass to expose the protected method for testing
class TestInitCapitalContractVerifier extends InitCapitalContractVerifier {
  public async testGetContracts(registry: InitCapitalRegistry) {
    return this.getContracts(registry)
  }
}

describe('InitCapitalContractVerifier.ts', () => {
  const registry: InitCapitalRegistry = {
    accessControlManager: '0xb6af95840b1bd826032b9069fefc4fb6fc03ed90',
    proxyAdmin: '0x9b6b2e8e0c31e2ee2c3ba1ed7c76cfaf42407d60',
    initOracleImpl: '0xc0ebaa36692474705b65e7e90868425e6ff308da',
    configImpl: '0x4636314744c9b6205269ad708fbd3c7e7084a067',
    liqIncentiveCalculatorImpl: '0x75b8a773e58b43330af4039728a97d0155484ba5',
    posManagerImpl: '0xe68e4e7bd48f4871e04147aa72e522af39e162d3',
    initOracleProxy: '0x128ba440095ef36e37a3388032965ccff4a50a0e',
    configProxy: '0xf44342bd3c97daa173375fea60fd9cf740dfe552',
    liqIncentiveCalculatorProxy: '0xc0e92fdf0bd35fbfb548675f044d6ace81ca738f',
    posManagerProxy: '0xf110c5cbb61cfbc31dca4db3663409d4bf9626c0',
    initCoreImpl: '0xc26d25b283573021671a355b1eec054dfae3b0b6',
    initCoreProxy: '0xc6a9c72abfcc6dd8be30655f6314eadfe47a9565',
    feeVault: '0xa028fc9d46d2be72bc1b34eebb56d86bb110797e',
    riskManagerImpl: '0x01ae4e8f81b3b7cd408b3e35fee3639e9a458970',
    lendingPoolImpl: '0xd3d6d79a7dedbeb525ec01e327483e6ac04fb49a',
    moneyMarketHookImpl: '0x177f3e157236277f804ff646a2e70e4d46227c9b',
    riskManagerProxy: '0xc74f2ee4392a5f3da293498b8900ee7ebd165166',
    moneyMarketHookProxy: '0xaf285c6287f51000793ce7693dc0c943699902a8',
    initLens: '0x7b4b844f8e938aac58c2c2722443fa8b3a155fca',
    irms: {
      StablecoinIRM: '0x5d1b04d16c1dfe353d2cdb05de2affaff789d090',
      MajorcoinIRM: '0x098a02bb62657a46b75615ced2908bc5fd5dc23e',
      MemecoinIRM: '0x2a1aa2f2cfdc3cde267b1b3d00a019beb2185506',
      LrtcoinIRM: '0x0c2dab00b4b808b41724d4bccf7cb7d74addb551',
      testIRM: '0xec176a968e893c5806e84354214059be782fe824',
    },
    api3ProxyOracleReaderImpl: '0x1c20426ec40fe317cc76060b2aabadf056c9c476',
    api3ProxyOracleReaderProxy: '0x13832f1340e648f407acfa41e0e582ae538fda12',
    lendingPools: {
      test_new_pool: {
        lendingPool: '0x57a72a968c07b0ae4b74e2b1620236720fa482de',
        underlyingToken: '0x87350147a24099bf1e7e677576f01c1415857c75',
        irm: '0xec176a968e893c5806e84354214059be782fe824',
      },
    },
  }

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestInitCapitalContractVerifier(
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
