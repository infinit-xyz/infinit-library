import fs from 'fs'

import { DirectoryNotFoundError } from '@/errors'
import { DependencyGraph } from 'hardhat/internal/solidity/dependencyGraph.js'
import { Parser } from 'hardhat/internal/solidity/parse.js'
import { Resolver } from 'hardhat/internal/solidity/resolver.js'

export const getDependencyGraph = async (sourceName: string, projectRoot: string): Promise<DependencyGraph> => {
  const parser = new Parser()

  // NOTE: quick fix here
  // TODO: Need to recheck why fee-vault not remapped
  const remappings: Record<string, string> = sourceName.includes("FeeVault.sol")?{
    "@openzeppelin-contracts/": "node_modules/@openzeppelin/contracts-5.0.2/",
  }:{}

  const resolver = new Resolver(
    projectRoot,
    parser,
    remappings,
    (absolutePath: string) => compileSolidityReadFile({ absolutePath }),
    (importName: string) => transformImportName({ importName }),
  )

  const resolvedFile = await resolver.resolveSourceName(sourceName)

  return DependencyGraph.createFromResolvedFiles(resolver, [resolvedFile])
}

const compileSolidityReadFile = async ({ absolutePath }: { absolutePath: string }): Promise<string> => {
  try {
    return await fs.promises.readFile(absolutePath, {
      encoding: 'utf8',
    })
  } catch (e) {
    if (fs.lstatSync(absolutePath).isDirectory()) {
      throw new DirectoryNotFoundError(absolutePath)
    }

    throw e
  }
}
const transformImportName = async ({ importName }: { importName: string }): Promise<string> => {
  return importName
}
