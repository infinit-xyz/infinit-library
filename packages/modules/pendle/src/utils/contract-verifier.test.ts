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
  const registry: PendleRegistry = {
    baseSplitCodeFactoryContract: '0xa1c1c280822a70e414bf69ba137f6357b44f52a2',
    pendleSwap: '0xc3d11902938ba2fd41b78328c0422f7eecc95cab',
    pendleMsgSendEndpointUpgImpl: '0xc34980bebe8502664ccf7d737d0a0a9b449df27d',
    pendleMsgSendEndpointUpgProxy: '0x06d46b95bcd056ba2f71c7b5c5d59518b2e5261e',
    votingEscrowPendleMainchain: '0xba76b089119c9b9a1cfebbfbb6f9af1517f492ab',
    pendleYieldContractFactory: '0x7c4ffd0cbcc09adcb44ad742af3e17a19e3a2725',
    oracleLib: '0xb9404bf03c9470aefa6f76d2d6143569487201cd',
    pendleVotingControllerUpgImpl: '0x52746b8730db3f563fa247ad1ae8107c1c55fbbe',
    pendleVotingControllerUpgProxy: '0xf498122e6ad20478e2f7f43a4f71c1f14fa913d5',
    pendleGaugeControllerMainchainUpgImpl: '0x906c6be1476d5ebe1131f90bdc88aae7fe512a0f',
    pendleGaugeControllerMainchainUpgProxy: '0xbd12bd428660046f56301ddc4c0cdeca9b53e742',
    pendleMarketFactoryV3: '0x3885c047f7a5b4266aa4f7dc55694494eec4845b',
    routerStorageV4: '0xdc4ee48d889cb5b578cda7698bdc5f9f2266a9b8',
    actionAddRemoveLiqV3: '0xed208208c60e27562cbee83d75cafdfb3feaefda',
    actionCallbackV3: '0x57f575e1714e136ae10a5cec2845e1330224a918',
    actionMiscV3: '0x7b97f317de3ecf0a91cad83b4700edd0cc4d1f89',
    actionSimple: '0x2c04da4d8606494da2efb8c1cbb4ef729b5162e2',
    actionSwapPTV3: '0x25f41915852b41782c5fcd15f0d63924bf50a752',
    actionSwapYTV3: '0x6b939c4ccb22526a1989df2dcea49d36fa097de2',
    pendleRouterV4: '0xd661062002d9319d2fdabe21d9e0fbe9ba4d5ba6',
    actionStorageStatic: '0xc61802f976c88307291b494c3105614c3c073960',
    actionInfoStatic: '0xf6051261d4e5fad492a4501c04174881c226166c',
    actionMarketAuxStatic: '0x8c2f12783b9adf4affec321e488ccd1d40298c8d',
    actionMarketCoreStatic: '0x12b83df96e6e2dd315e3fbad3439fd1aad34bfc6',
    actionMintRedeemStatic: '0x26c58376f164ff680d370f969d7f701d233d699f',
    actionVePendleStatic: '0x26ddc808243300f1285528e356f02b07d8f4420d',
    pendleRouterStatic: '0xc9569e07bb5e4e8ac6cca49d7b520b98532066ad',
    proxyAdmin: '0x595225975dde6f422328617c4c55b14010470991',
    pendleLimitRouterImpl: '0xd6dd32a87bca870819d0bfea12058ccb2d3d0dc8',
    pendleLimitRouterProxy: '0x89fa9681fb808f02b47235924f503937486ee280',
    pendlePYLpOracle: '0xd3b31da7317cd1cf8fa1398d485061513515e4ef',
    pendlePYLpOracleProxy: '0xb71309e4d3e653c5830a2cf2af5a0a8ad41488b0',
    pendleMulticallV2: '0xd45d1550b1b3e730fdf37a43cd963614513616c1',
    multicall: '0x3059dc23ca80f575d518d13276b20b6cd71734ea',
    simulateHelper: '0x36e3ee95a0e62911d40f7cf058c378d75c94d31e',
    supplyCapReader: '0x27e0f7a59eca46dff3b2a9de07385e237867df65',
    pendlePoolDeployHelper: '0x05e0a84b5effa7bf2350f3cd14633c8df6544339',
    pendleGovernanceProxyImpl: '0x214c233fa5bd380c8e9602d7b7dfb9a3d3e0f07f',
    pendleGovernanceProxy: '0x9af271d3cc828c87d2b0f6b1eb3943e2f4e0a8fd',
    pendleBoringOneracle: '0xda27654ccbb33ac3b7253add434afec793a8b4ab',
  }

  test('getContracts: should match snapshot', async () => {
    const verifier = new TestPendleContractVerifier(
      createPublicClient({
        chain: holesky,
        transport: http('https://holesky.drpc.org/'),
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
