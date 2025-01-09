import fs from 'fs'

import { DependencyGraph } from 'hardhat/internal/solidity/dependencyGraph.js'
import { Parser } from 'hardhat/internal/solidity/parse.js'
import { Resolver } from 'hardhat/internal/solidity/resolver.js'

export const getDependencyGraph = async (sourceNames: string[], projectRoot: string): Promise<DependencyGraph> => {
  const parser = new Parser()
  const remappings: Record<string, string> = {}
  const resolver = new Resolver(
    projectRoot,
    parser,
    remappings,
    (absolutePath: string) => compileSolidityReadFile({ absolutePath }),
    (importName: string) => transformImportName({ importName }),
  )
  const resolvedFiles = await Promise.all(sourceNames.map((sn) => resolver.resolveSourceName(sn)))
  return DependencyGraph.createFromResolvedFiles(resolver, resolvedFiles)
}

const compileSolidityReadFile = async ({ absolutePath }: { absolutePath: string }): Promise<string> => {
  try {
    return await fs.promises.readFile(absolutePath, {
      encoding: 'utf8',
    })
  } catch (e) {
    if (fs.lstatSync(absolutePath).isDirectory()) {
      throw new Error('adf')
    }

    throw e
  }
}
const transformImportName = async ({ importName }: { importName: string }): Promise<string> => {
  return importName
}
