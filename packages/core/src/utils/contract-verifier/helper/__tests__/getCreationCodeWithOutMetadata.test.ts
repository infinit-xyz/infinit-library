import path from 'path'
import { describe, expect, test } from 'vitest'

import { getCreationCodeWithOutMetadata } from '../getCreationCodeWithOutMetadata'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'

describe('getCreationCodeWithOutMetadata', () => {
  const artifacts = new ArtifactsFromPath(
    path.join(process.cwd(), 'packages/core/src/utils/contract-verifier/helper/__mocks__/mock-artifacts'),
  )
  const metadata = 'a2646970667358221220e9046d113f58c010ee9536b98f2e1599c212e383de39c9cf1d7f905cc96af67c64736f6c634300080a0033'

  test('with metadata', async () => {
    const artifact = await artifacts.readArtifact('L2Pool')
    const creationCode = await getCreationCodeWithOutMetadata(artifact.bytecode, artifact.deployedBytecode)
    expect(creationCode).not.include(metadata)
  })

  test('without metadata', async () => {
    const artifact = await artifacts.readArtifact('ERC20')
    const creationCode = await getCreationCodeWithOutMetadata(artifact.bytecode, artifact.deployedBytecode)
    expect('0x' + creationCode).toEqual(artifact.bytecode)
  })
})
