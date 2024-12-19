// check that all selector is in txData
import { describe, expect, test } from 'vitest'

import { Hex, decodeFunctionData } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  FacetForSelectors,
  SetFacetForSelectorsTxBuilder,
  SetFacetForSelectorsTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/setFacetForSelectors'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester pk
const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor

// NOTE: test with Aave v3 on arbitrum
describe('SetFacetForSelectorsTxBuilder', () => {
  let txBuilder: SetFacetForSelectorsTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('check txData', async () => {
    // Define the parameters for the transaction builder
    const params: SetFacetForSelectorsTxBuilderParams = {
      pendleRouterStatic: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      actionStorageStatic: '0x6a0Ed0A9193FCBe7ae9B0F3D90F88e365Cca64fC',
      actionInfoStatic: '0xE005527cDe6cc594eb82d7919b13433121F4a498',
      actionMarketAuxStatic: '0x997FBC511a8Ad11F84a400feACD66E2A3fa805d2',
      actionMarketCoreStatic: '0xc1db948dC759b14258D12821dF56FDF639846468',
      actionMintRedeemStatic: '0x5eBD8cfDc82Fb95488eB16881a6dBc1feD598a7a',
      actionVePendleStatic: '0xB8C69B95AEE772902D84B977a3005a800Dc20788',
    }

    // Initialize the transaction builder with the client and parameters
    txBuilder = new SetFacetForSelectorsTxBuilder(client, params)

    // Build the transaction
    const tx = await txBuilder.buildTx()

    // Check that the transaction recipient is the pendleRouter address
    expect(tx.to).toBe(params.pendleRouterStatic)

    // Ensure the transaction data is defined
    expect(tx.data).toBeDefined()

    // Decode the function data from the transaction
    const calldata = tx.data ?? '0x0'
    const artifact = await readArtifact('ActionStorageStatic')
    const decodedData = decodeFunctionData({ abi: artifact.abi, data: calldata })

    // Verify the function name in the decoded data
    expect(decodedData.functionName).toBe('setFacetForSelectors')

    // Define the expected selectors for each facet
    const selectorMap: { [key: string]: Hex[] } = {
      [params.actionStorageStatic]: ['0x4e71e0c8', '0xcdffacc6', '0x0a33de0d', '0xddf46a26', '0x051cee29', '0x078dfbe7'],
      [params.actionInfoStatic]: ['0x227501f5', '0x16929b7e', '0x372cfb93', '0x9225afd6', '0x6ce43709'],
      [params.actionMarketAuxStatic]: [
        '0x0ac6aa69',
        '0xa34560c6',
        '0xd1b087c9',
        '0x6e4b3f20',
        '0x955ee4e7',
        '0xbcc454e2',
        '0xe8a89c76',
        '0xf2344deb',
        '0x62576930',
        '0x5dc9bdbe',
        '0x0f8cb321',
        '0x54b125a6',
        '0x08b35232',
        '0x6e22df2f',
        '0xe7f31763',
        '0x94f8c15b',
        '0x771a49c0',
      ],
      [params.actionMarketCoreStatic]: [
        '0x38f3ba8e',
        '0x3c71db3d',
        '0x1e965851',
        '0x88a485f3',
        '0x5b42f5e3',
        '0x457c4464',
        '0xa3ccc850',
        '0x9e487673',
        '0x9766cb4e',
        '0xaf2c7971',
        '0xa9d09ae3',
        '0x9a01bff6',
        '0x252a6227',
        '0x1e0b8294',
        '0x31562d05',
        '0x8d4ab764',
        '0xb1f36065',
        '0x8c0cc77c',
        '0x26e44ccf',
        '0xe9ecd3b2',
        '0x3b672dcd',
        '0xd8d33078',
        '0x70f2c7fc',
        '0x340e1126',
        '0x6e7721ab',
        '0x25cadd2c',
        '0x53dfc868',
      ],
      [params.actionMintRedeemStatic]: [
        '0xb37bc69d',
        '0x1bb00860',
        '0x5fbdb155',
        '0xfea11471',
        '0x295c2ea6',
        '0x4303d0db',
        '0x80cb9d76',
        '0x09fa708a',
        '0xed84175d',
      ],
      [params.actionVePendleStatic]: ['0x180e3943'],
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
