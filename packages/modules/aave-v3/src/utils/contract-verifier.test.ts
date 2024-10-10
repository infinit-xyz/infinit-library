import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { holesky } from 'viem/chains'

import { AaveV3Registry } from '../type'
import { AaveV3ContractVerifier } from './contract-verifier'

// Create a subclass to expose the protected method for testing
class TestAaveV3ContractVerifier extends AaveV3ContractVerifier {
  public async testGetContracts(registry: AaveV3Registry) {
    return this.getContracts(registry)
  }
}

describe('AaveV3ContractVerifier.ts', () => {
  const registry: AaveV3Registry = {
    poolAddressProviderRegistry: '0xed4b96e65132287cdfceb5bb891b12c4f35a7d07',
    supplyLogic: '0xf4d4555bccb25f57d38402295fc4cb22aa1f1e7b',
    borrowLogic: '0x9df952e8f2f752d65f383987104145adadbdae74',
    liquidationLogic: '0xe360332c6a6a611cfded42daebaebe075cccda03',
    eModeLogic: '0x76765b6546cb530009a07abc7b9884db399243a8',
    bridgeLogic: '0x3e1643471239f86f173850720ffff63f5e33838e',
    configuratorLogic: '0x5a4d5610ba08d9a019aa7f68b5317996072c5630',
    poolLogic: '0xd6d69359ef662106dc767c35cfd818a6a536de16',
    aaveEcosystemReserveV2Proxy: '0xaa9f6f6a281f176968574ff2fea55783fdd56b16',
    aaveEcosystemReserveController: '0x1b476c1a75e3d61ffcc8162070e42b32c97b42fb',
    aaveEcosystemReserveV2Impl: '0x7a2a9a30d942305e7d52b8e309b8b717d8be15d7',
    poolAddressesProvider: '0x44a7818e44e2e328210a7ca773a5ca4044fedf26',
    reservesSetupHelper: '0x7390e9eafc6a6afe332e2f5ac8e53e677dc5755a',
    walletBalanceProvider: '0xf9de6d863d2474537e077620c86fba79a67809a5',
    uiIncentiveDataProvider: '0xd3c7d30d88b00e14e8debb6c8d2351311147bd1d',
    uiPoolDataProviderV3: '0x4d43bb9a1bf9dc564250ccbc70d277b87af1daa5',
    emissionManager: '0x8dbcb843d6763655ca7addeae1cc03ef723f3e33',
    aaveProtocolDataProvider: '0x3d3b400d21e518471b5929db5b20de7b33454ac6',
    flashLoanLogic: '0x8f679eaf072d6a346f2a1a4597eb5e22337ed5ee',
    poolConfiguratorImpl: '0xb6d8fa4a79e402a12a91d93806f0778e9a6d5b38',
    aclManager: '0x33ebc17143e38ed877514f16f37e4ac124528fcb',
    aaveOracle: '0x00e9faa434f07aeaa14db2d3cbaa65fbfd2397a2',
    rewardsControllerImpl: '0x312578528c108700265819b89b8337557f1b3890',
    reserveInterestRateStrategies: {
      rateStrategyVolatileOne: '0x67e2eb9e8c38b2597e835a3914822f92bb43a193',
    },
    l2PoolImpl: '0x5b0c1fda2b61427fc8e84b1e3810f3847a63c3e2',
    poolProxy: '0xF1E061CC318160B8490D7E9E9Ba13b1FaA927f2b',
    poolConfiguratorProxy: '0xF2a93eD27f61969bD7EE8F170Bb4024a481Fb6D5',
    rewardsControllerProxy: '0xA3C641B31a4aDA7C4676954E8F4E35158352c778',
    wrappedTokenGatewayV3: '0xe8bc6291e6794631bf683e4c757d2212e2944009',
    l2Encoder: '0x0dd3adc925cfd041661be3083281000b59cff101',
    aTokenImpl: '0x07fc7e7d7908f4ccd5604c45702ad92867498424',
    delegationAwareATokenImpl: '0xc302fbb999d7e36d2326ccf4c663d9893b06a278',
    stableDebtTokenImpl: '0x35eaaa18aa6ed5e0c17b51b030076d4476cb6c01',
    variableDebtTokenImpl: '0x6bf2168cebd62eb0c89f5d88ed8ff1fa41c24577',
    pullRewardsTransferStrategy: '0x554d2af481073b3552ced42d12032c9c9057481f',
    lendingPools: {
      WETH: {
        underlyingToken: '0x6B5817E7091BC0C747741E96820b0199388245EA',
        interestRateStrategy: '0x67e2eb9e8c38b2597e835a3914822f92bb43a193',
        aToken: '0xC1972a55235cCD222b1FAd713025652374cf31F1',
        stableDebtToken: '0x2A556b9e34dc204aa7Ce924342f544351Ed74885',
        variableDebtToken: '0x0bA89BEA0EB039B907Fa5d7CFb63D9044529Cd14',
      },
    },
  }

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestAaveV3ContractVerifier(
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
