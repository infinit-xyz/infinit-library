import { Address, PublicClient } from 'viem'

import type { Artifacts } from 'hardhat/types/artifacts'

import { ContractInformation, extractMatchingContractInformation } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts.js'
import { Bytecode } from '@nomicfoundation/hardhat-verify/internal/solc/bytecode.js'

export const getContractInformation = async (client: PublicClient, artifacts: Artifacts, contract: { address: Address }) => {
  // get deploy bytecode from chain
  const code = await client.getCode({ address: contract.address })
  if (!code) {
    throw new Error(`No deployed bytecode found at address ${contract.address}`)
  }
  const deployedBytecode = code.replace(/^0x/, '')
  const bytecode = new Bytecode(deployedBytecode)

  let contractInformation: ContractInformation | null = null
  const fqNames = await artifacts.getAllFullyQualifiedNames()

  for (const fqName of fqNames) {
    const buildInfo = await artifacts.getBuildInfo(fqName)
    if (buildInfo === undefined) continue

    // Normalize deployed bytecode according to this object
    contractInformation = extractMatchingContractInformation(fqName, buildInfo, bytecode)

    if (contractInformation !== null) {
      break
    }
  }
  if (contractInformation === null) {
    throw new Error(`No matching contract found for address ${contract.address}`)
  }
  return contractInformation
}
