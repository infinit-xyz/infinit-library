// check that all selector is in txData
import { describe, expect, test } from 'vitest'

import { Hex, decodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  FacetForSelectors,
  SetSelectorToFacetsTxBuilder,
  SetSelectorToFacetsTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleRouter/setSelectorToFacets'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester pk
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('SetSelectorToFacetsTxBuilder', () => {
  let txBuilder: SetSelectorToFacetsTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('check txData', async () => {
    // Define the parameters for the transaction builder
    const params: SetSelectorToFacetsTxBuilderParams = {
      pendleRouter: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      actionStorageV4: '0x6a0Ed0A9193FCBe7ae9B0F3D90F88e365Cca64fC',
      actionAddRemoveLiqV3: '0xE005527cDe6cc594eb82d7919b13433121F4a498',
      actionCallbackV3: '0x997FBC511a8Ad11F84a400feACD66E2A3fa805d2',
      actionMiscV3: '0xc1db948dC759b14258D12821dF56FDF639846468',
      actionSimple: '0x5eBD8cfDc82Fb95488eB16881a6dBc1feD598a7a',
      actionSwapPTV3: '0xB8C69B95AEE772902D84B977a3005a800Dc20788',
      actionSwapYTV3: '0x2514ce04fF17862c63a806c59243C738B540B401',
    }

    // Initialize the transaction builder with the client and parameters
    txBuilder = new SetSelectorToFacetsTxBuilder(client, params)

    // Build the transaction
    const tx = await txBuilder.buildTx()

    // Check that the transaction recipient is the pendleRouter address
    expect(tx.to).toBe(params.pendleRouter)

    // Ensure the transaction data is defined
    expect(tx.data).toBeDefined()

    // Decode the function data from the transaction
    const calldata = tx.data ?? '0x0'
    const artifact = await readArtifact('ActionStorageV4')
    const decodedData = decodeFunctionData({ abi: artifact.abi, data: calldata })

    // Verify the function name in the decoded data
    expect(decodedData.functionName).toBe('setSelectorToFacets')

    // Define the expected selectors for each facet
    const selectorMap: { [key: string]: Hex[] } = {
      [params.actionStorageV4]: ['0x078dfbe7', '0x4e71e0c8', '0x8da5cb5b', '0xae7473ac', '0xe30c3978'],
      [params.actionAddRemoveLiqV3]: [
        '0x12599ac6',
        '0x2756ce06',
        '0x3dbe1c55',
        '0x4e390267',
        '0x58bda475',
        '0x60da0860',
        '0x6b77ac9e',
        '0x844384aa',
        '0x97ee279e',
        '0xb00f09d7',
        '0xb7d75b8b',
        '0xd13b4fdc',
      ],
      [params.actionCallbackV3]: ['0xeb3a7d47', '0xfa483e72'],
      [params.actionMiscV3]: [
        '0x0741a803',
        '0x1a8631b2',
        '0x2d8f9d8d',
        '0x2e071dc6',
        '0x339748cb',
        '0x339a5572',
        '0x47f1de22',
        '0x5d3e105c',
        '0x60fc8466',
        '0x7036e052',
        '0x8354a5e5',
        '0x9fa02c86',
        '0xa373cf1a',
        '0xa89eba4a',
        '0xbd61951d',
        '0xc2d6d65d',
        '0xd0f42385',
        '0xf06a07a0',
        '0xf7e375e8',
      ],
      [params.actionSimple]: [
        '0x0af8a5cf',
        '0x22bfddd0',
        '0x252f9db3',
        '0x40a169f9',
        '0x4cc30915',
        '0x6afe6998',
        '0xf2f6eae5',
        '0xfeb9d1d2',
      ],
      [params.actionSwapPTV3]: ['0x2a50917c', '0x3346d3a3', '0x594a88cc', '0xc81f847a'],
      [params.actionSwapYTV3]: ['0x05eb5327', '0x448b9b95', '0x7b8b4b95', '0x80c4d566', '0xc861a898', '0xed48907e'],
    }

    // Verify that all selectors are present in the transaction data
    for (let i = 0; i < decodedData.args[0]!.length; i++) {
      const selectorToFacets = decodedData.args[0]![i] as FacetForSelectors
      const expectedSelectors = selectorMap[selectorToFacets.facet]
      expect(selectorToFacets.selectors.length).toBe(expectedSelectors.length)
      for (let j = 0; j < expectedSelectors.length; j++) {
        expect(selectorToFacets.selectors).toContain(expectedSelectors[j])
      }
    }
  })
})
