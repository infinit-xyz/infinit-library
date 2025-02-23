import path from 'path'
import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { getContractInformation } from '../getContractInformation'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'

describe('getCreationInformation', () => {
  const address = '0x9a3c2b73adac0f85e04ea049df31ffc2a8e35401'
  const invalidAddress = '0x87646Ac012AC9ffbBc3A37ec516Bd0d661b408ed'
  const rpc = 'https://arbitrum-sepolia-rpc.publicnode.com'

  const artifacts = new ArtifactsFromPath(
    path.join(process.cwd(), 'packages/core/src/utils/contract-verifier/helper/__mocks__/mock-artifacts'),
  )

  test('have artifact', async () => {
    const client = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc),
    })
    const contractInformation = await getContractInformation(client, artifacts, { address: address })
    expect(contractInformation.contractName).toBe('L2Pool')
  })

  test("don't have aritifact", async () => {
    const expectedError = 'No matching contract found for address 0x87646Ac012AC9ffbBc3A37ec516Bd0d661b408ed'
    const client = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc),
    })
    expect(getContractInformation(client, artifacts, { address: invalidAddress })).rejects.toThrowError(expectedError)
  })
})
