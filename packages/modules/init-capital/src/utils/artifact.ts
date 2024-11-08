import path from 'path'

import type { Artifacts, ArtifactsMap } from 'hardhat/types/artifacts'

import { moduleDir } from '../constants'
import { name } from '@/package.json'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'

const readArtifact = async <ArgT extends keyof ArtifactsMap>(contractNameOrFullyQualifiedName: ArgT): Promise<ArtifactsMap[ArgT]> => {
  //Use moduleDir only when testing for vitest.
  const artifactsBase = process.env.NODE_ENV === 'test' ? moduleDir : process.cwd()
  const artifacts: Artifacts = new ArtifactsFromPath(path.join(artifactsBase, `./artifacts/${path.basename(name)}`))
  const artifact = await artifacts.readArtifact(contractNameOrFullyQualifiedName)
  return artifact as ArtifactsMap[ArgT]
}

const getArtifacts = async (): Promise<Artifacts> => {
  //Use moduleDir only when testing for vitest.
  const artifactsBase = process.env.NODE_ENV === 'test' ? moduleDir : process.cwd()
  const artifacts: Artifacts = new ArtifactsFromPath(path.join(artifactsBase, `./artifacts/${path.basename(name)}`))
  return artifacts
}

export { readArtifact, getArtifacts }
