import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address } from 'viem'

import type { Artifacts } from 'hardhat/types/artifacts'

import { ContractInformation, LibraryToAddress, SourceToLibraryToAddress } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts.js'

export const resolveLinkedLibraries = async (
  artifacts: Artifacts,
  contractInformation: ContractInformation,
): Promise<ContractInformation> => {
  const libraries: SourceToLibraryToAddress = {}
  const librariesAddress: LibraryToAddress = {}
  const linkReferences = contractInformation.contractOutput.evm.deployedBytecode.linkReferences
  for (const [sourceName, librariesToIndex] of Object.entries(linkReferences)) {
    for (const [libraryName, indexes] of Object.entries(librariesToIndex)) {
      const startIndex = indexes[0].start
      const length = indexes[0].length
      // slice library address from deployed bytecode using link references
      const libraryAddress = '0x' + contractInformation.deployedBytecode.slice(startIndex * 2, (startIndex + length) * 2)
      if (libraries[sourceName] === undefined) {
        libraries[sourceName] = {}
      }
      libraries[sourceName][libraryName] = libraryAddress
      librariesAddress[libraryName] = libraryAddress
    }
  }
  // if there are linked lib
  if (Object.keys(librariesAddress).length > 0) {
    const contractFQN = `${contractInformation.sourceName}:${contractInformation.contractName}`
    const artifact = await artifacts.readArtifact(contractFQN)
    contractInformation.contractOutput.evm.bytecode.object = await resolveBytecodeWithLinkedLibraries(
      artifact,
      librariesAddress as Libraries<Address>,
    )
  }
  contractInformation.compilerInput.settings.libraries = libraries
  return contractInformation
}
