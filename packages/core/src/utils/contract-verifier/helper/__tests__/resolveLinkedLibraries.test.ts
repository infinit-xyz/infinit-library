import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'
import path from 'path'
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import { getContractCreationCode } from '../getContractCreationCode'
import { getContractInformation } from '../getContractInformation'
import { getCreationCodeWithOutMetadata } from '../getCreationCodeWithOutMetadata'
import { resolveLinkedLibraries } from '../resolveLinkedLibraries'

describe('resolveLinkedLibraries', () => {
  const apiKey = 'U19FHTSVAE2MTBTG89IWKF6ERWW9VX9IY4'
  const apiUrl = 'https://api-sepolia.arbiscan.io/api'
  const url = 'https://sepolia.arbiscan.io'
  const withLib = "0x9a3c2b73adac0f85e04ea049df31ffc2a8e35401"
  const withOutLib = "0xefe36d040540d7e6cb0b11550212bb87d31e2c9b"
  const rpc = "https://arbitrum-sepolia.blockpi.network/v1/rpc/public"
  const artifacts = new ArtifactsFromPath(path.join(process.cwd(), "packages/core/src/utils/contract-verifier/helper/__mocks__/mock-artifacts"))
  const instance = new Etherscan(apiKey, apiUrl, url)
  
  test('have lib', async () => {
    const client = await createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc)
    })
    let contractInformation = await getContractInformation(client, artifacts, { address: withLib })
    contractInformation = await resolveLinkedLibraries(artifacts, contractInformation)
    const contractCreationCode = await getContractCreationCode(instance, withLib)
    const onChainCreationCode = await getCreationCodeWithOutMetadata(contractCreationCode, contractInformation.deployedBytecode)
    const artifactCreationCode = await getCreationCodeWithOutMetadata(
      contractInformation.contractOutput.evm.bytecode.object,
      contractInformation.contractOutput.evm.deployedBytecode.object,
    )
    const encodedConstructorArgs = onChainCreationCode.replace(artifactCreationCode, '')
    const onChainCreationCodeWithoutParams = onChainCreationCode.replace(encodedConstructorArgs, '')
    expect(onChainCreationCodeWithoutParams).toEqual(artifactCreationCode)
  })

  test("don't have lib", async () => {
    const client = await createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc)
    })
    const contractInformation = await getContractInformation(client, artifacts, { address: withOutLib })
    const resolvedContractInformation = await resolveLinkedLibraries(artifacts, contractInformation)
    expect(contractInformation.contractOutput.evm.bytecode.object).toEqual(resolvedContractInformation.contractOutput.evm.bytecode.object)
  })
})