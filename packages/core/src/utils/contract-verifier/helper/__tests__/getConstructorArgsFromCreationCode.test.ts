import path from 'path'
import { describe, expect, test } from 'vitest'

import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { getConstructorArgsFromCreationCode } from '../getConstructorArgsFromCreationCode'
import { getContractInformation } from '../getContractInformation'
import { resolveLinkedLibraries } from '../resolveLinkedLibraries'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'

describe('getConstructorArgsFromCreationCode', () => {
  const apiKey = process.env.SEPOLIA_ARBISCAN_API_KEY ?? 'NO_API_KEY'
  const apiUrl = 'https://api-sepolia.arbiscan.io/api'
  const url = 'https://sepolia.arbiscan.io'
  const withParams = '0x9a3c2b73adac0f85e04ea049df31ffc2a8e35401'
  const withoutParams = '0xe426a3c7d8e769d617859ffe57d2fb407b778864'
  const rpc = 'https://arbitrum-sepolia-rpc.publicnode.com'
  const artifacts = new ArtifactsFromPath(
    path.join(process.cwd(), 'packages/core/src/utils/contract-verifier/helper/__mocks__/mock-artifacts'),
  )
  const instance = new Etherscan(apiKey, apiUrl, url)

  test('have constructor params', async () => {
    const client = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc),
    })
    let contractInfomation = await getContractInformation(client, artifacts, { address: withParams })
    contractInfomation = await resolveLinkedLibraries(artifacts, contractInfomation)
    const constructorArgs = await getConstructorArgsFromCreationCode(instance, withParams, contractInfomation)
    expect(constructorArgs).toBe('00000000000000000000000015d79ca26ad53d4d2fa60472b0fef6b7103ecc13')
  })

  test("don't have constructor params", async () => {
    const client = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc),
    })
    let contractInfomation = await getContractInformation(client, artifacts, { address: withoutParams })
    contractInfomation = await resolveLinkedLibraries(artifacts, contractInfomation)
    const constructorArgs = await getConstructorArgsFromCreationCode(instance, withoutParams, contractInfomation)
    expect(constructorArgs).toBe('')
  })
})
