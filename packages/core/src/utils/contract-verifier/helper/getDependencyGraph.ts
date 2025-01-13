import { DirectoryNotFoundError } from '@/errors'
import { DependencyGraph } from 'hardhat/internal/solidity/dependencyGraph.js'
import { Parser } from 'hardhat/internal/solidity/parse.js'
import { Resolver } from 'hardhat/internal/solidity/resolver.js'
import * as fs from 'node:fs/promises'

export const getDependencyGraph = async (sourceName: string, projectRoot: string): Promise<DependencyGraph> => {
  const parser = new Parser()

  const remappings = await getRemappings(sourceName)

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
    return await fs.readFile(absolutePath, {
      encoding: 'utf8',
    })
  } catch (e) {
    const stats = await fs.lstat(absolutePath)
    if (stats.isDirectory()) {
      throw new DirectoryNotFoundError(absolutePath)
    }
    throw e
  }
}

const transformImportName = async ({ importName }: { importName: string }): Promise<string> => {
  return importName
}

// NOTE: quick fix here
// TODO: use remappings from remappings file in contract project along with hardhatconfig
const getRemappings = async (sourceName: string): Promise<Record<string, string>> => {
  let remappings: Record<string, string> = {}

  // fee-vault's remappings
  if (sourceName.startsWith('fee-vault')) {
    remappings = { '@openzeppelin-contracts/': '@openzeppelin/contracts-5.0.2/' }
  }

  // init-capital: init-capital's remappings
  else if (sourceName.startsWith('init-capital')) {
    remappings = {
      '@openzeppelin-contracts/': '@openzeppelin/contracts-4.9.3/',
      '@openzeppelin-contracts-upgradeable/': '@openzeppelin/contracts-upgradeable-4.9.3/',
    }
  }

  // init-capital: openzeppelin's remappings
  // NOTE: openzeepelin in pendle has no remappings so it shouldn't be a problem
  else if (sourceName.startsWith('openzeppelin')) {
    remappings = {
      '@openzeppelin-contracts/': '@openzeppelin/contracts-4.9.3/',
      '@openzeppelin-contracts-upgradeable/': '@openzeppelin/contracts-upgradeable-4.9.3/',
    }
  }

  // token: infinit-erc20-contracts's remappings
  else if (sourceName.startsWith('infinit-erc20-contracts')) {
    remappings = {
      '@openzeppelin/contracts/': '@openzeppelin/contracts-5.0.0/',
    }
  }

  // uniswap-v3: openzeppelins@3.4.1 and swap router contract's remappings
  else if (sourceName.startsWith('openzeppelin@3.4.1') || sourceName.startsWith('swap-router-contracts')) {
    remappings = {
      '@openzeppelin/contracts': '@openzeppelin/contracts-3.4.1-solc-0.7-2',
    }
  }

  // uniswap-v3: universal router's remappings
  else if (sourceName.startsWith('universal-router')) {
    remappings = {
      '@openzeppelin/contracts': '@openzeppelin/contracts-4.7.0',
      'permit2/src': 'permit2/contracts',
    }
  }

  // uniswap-v3: v3-periphery's remappings
  else if (sourceName.startsWith('v3-periphery')) {
    remappings = {
      '@openzeppelin/contracts': '@openzeppelin/contracts-3.4.2-solc-0.7',
    }
  }

  // uniswap-v3: v3-staker's remappings
  else if (sourceName.startsWith('v3-staker')) {
    remappings = {
      '@openzeppelin/contracts': 'openzeppelin/contracts-3.4.1-solc-0.7-2`',
    }
  }

  return remappings
}
