import { Address } from 'viem'

import { getContractCreationCode } from './getContractCreationCode'
import { getCreationCodeWithOutMetadata } from './getCreationCodeWithOutMetadata'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan.js'
import { ContractInformation } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts.js'

export const getConstructorArgsFromCreationCode = async (
  instance: Etherscan,
  address: Address,
  contractInformation: ContractInformation,
) => {
  const contractCreationCode = await getContractCreationCode(instance, address)
  const onChainCreationCode = await getCreationCodeWithOutMetadata(contractCreationCode, contractInformation.deployedBytecode)
  const artifactCreationCode = await getCreationCodeWithOutMetadata(
    contractInformation.contractOutput.evm.bytecode.object,
    contractInformation.contractOutput.evm.deployedBytecode.object,
  )

  // replace artifactCreationCode in onChainCreationCode with empty string
  const encodedConstructorArgs = onChainCreationCode.replace(artifactCreationCode, '')
  return encodedConstructorArgs
}
