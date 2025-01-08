import { PublicClient } from 'viem'

import { ContractInfo } from '@/types/callback'
import type { Artifacts } from 'hardhat/types/artifacts'

import { Bytecode } from '@nomicfoundation/hardhat-verify/internal/solc/bytecode.js'
import { parseFullyQualifiedName } from 'hardhat/utils/contract-names'

const extractContractInformation = async (artifacts: Artifacts, fqName: string, bytecode: Bytecode) => {
  const buildInfo = await artifacts.getBuildInfo(fqName)
  if (buildInfo === undefined) return null

  const { sourceName, contractName } = parseFullyQualifiedName(fqName)
  const contractOutput = buildInfo.output.contracts[sourceName][contractName]
  return {
    compilerInput: buildInfo.input,
    solcLongVersion: buildInfo.solcLongVersion,
    sourceName,
    contractName,
    contractOutput,
    deployedBytecode: bytecode.stringify(),
  }
}

const findContractInformation = async (artifacts: Artifacts, bytecode: Bytecode) => {
  const fqNames = await artifacts.getAllFullyQualifiedNames()
  for (const fqName of fqNames) {
    const contractInformation = await extractContractInformation(artifacts, fqName, bytecode)

    if (contractInformation !== null) {
      return contractInformation
    }
  }

  return null
}

export const getContractInformation = async (client: PublicClient, artifacts: Artifacts, contract: ContractInfo) => {
  // get deploy bytecode from chain
  const code = await client.getCode({ address: contract.address })
  if (!code) {
    throw new Error(`No deployed bytecode found at address ${contract.address}`)
  }
  const deployedBytecode = code.replace(/^0x/, '')
  const bytecode = new Bytecode(deployedBytecode)

  const contractInformation = contract.fqName
    ? await extractContractInformation(artifacts, contract.fqName, bytecode)
    : await findContractInformation(artifacts, bytecode)

  if (contractInformation === null) {
    throw new Error(`No matching contract found for address ${contract.address}`)
  }
  return contractInformation
}
