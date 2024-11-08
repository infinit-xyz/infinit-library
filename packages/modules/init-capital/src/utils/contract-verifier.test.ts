import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { TokenContractVerifier } from './contract-verifier'
import { InitCapitalRegistry } from '@/src/type'

// Create a subclass to expose the protected method for testing
class TestTokenContractVerifier extends TokenContractVerifier {
  public async testGetContracts(registry: InitCapitalRegistry) {
    return this.getContracts(registry)
  }
}

describe('TokenContractVerifier.ts', () => {
  const registry: InitCapitalRegistry = {
    accessControlManager: '0x90dd5250fd06b9e6e3d048caf7f26da609cb67cc',
    proxyAdmin: '0xba3c51fc0ff32e26fe3a6bc5f001d933bdee9dd3',
    initOracleImpl: '0xcc34062115ac818ae567daec69c29e3d8e16f1ec',
    configImpl: '0x62153519c210d21f1b67de11cf60d6f467190707',
    liqIncentiveCalculatorImpl: '0x93d027ecabf0b383f61cfad54d7d8fcae7972d33',
    posManagerImpl: '0x0e03350d11f24839373262143b46d8d68e5e6649',
    initOracleProxy: '0x03701c609ea55bfe68ad06fc36760cb25317edba',
    configProxy: '0xcc9f3144f1e57d4e3be528442452912ffcaa7b3c',
    liqIncentiveCalculatorProxy: '0x2e407758a16fa3f7d464ba6146c3cc7f1854a089',
    posManagerProxy: '0x9674f70c5ceb61f990977d325abf2c0201a4c520',
    initCoreImpl: '0x4fd715125cd4e604a89130a8d573db91b086cb60',
    initCoreProxy: '0x58f5a2711c7464b950361529ca81713b35d487b1',
    feeVault: '0xdeb76598edce92ae77f2d4f88542ed2c91b8de82',
    riskManagerImpl: '0x263a5ad450bd51cea3c818ba87c80608cb283508',
    lendingPoolImpl: '0x391d0aa2efaaddc7ccb7f0dc2a1e9336719085c8',
    moneyMarketHookImpl: '0x5de9ff054084071ca111f35180cb44c2e413be92',
    riskManagerProxy: '0x5433f79e82c136c9c2dc2f48d229627f7920acaf',
    moneyMarketHookProxy: '0xe1fc830bf20308cbba2b248c543e305b979a64ec',
    initLens: '0x3cfdf9646dbc385e47dc07869626ea36be7ba3a2',
    irms: {
      StablecoinIRM: '0x9a213f53334279c128c37da962e5472ecd90554f',
      MajorcoinIRM: '0xc55a98c1b3b0942883bb37df9716bea42d7d5009',
      MemecoinIRM: '0x12604a5b388a1e1834693bfe94dddf81a60b56a2',
      LrtcoinIRM: '0xd516492bb58f07bc91c972dccb2df654653d4d33',
    },
    api3ProxyOracleReaderImpl: '0xd23bf69104cc640e68ebee83b9833d6db6f220e6',
    api3ProxyOracleReaderProxy: '0x737b13202150ad597b72f77553b0ae30bb0c69e8',
    pythOracleReaderImpl: '0xec22b69767b5edd55b7dc6a4b6fd9ba4d0b3d320',
    pythOracleReaderProxy: '0xce33621c656f68fc35a461b7c9b09d90b9a1d548',
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
