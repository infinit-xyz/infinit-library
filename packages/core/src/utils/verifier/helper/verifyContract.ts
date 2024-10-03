import { PublicClient } from 'viem'

import type { Artifacts } from 'hardhat/types/artifacts'

import { ContractInfo, ContractVerifierCallback } from '../type'
import { getConstructorArgsFromCreationCode } from './getConstructorArgsFromCreationCode'
import { getContractInformation } from '@/utils/verifier/helper/getContractInformation'
import { resolveLinkedLibraries } from '@/utils/verifier/helper/resolveLinkedLibraries'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan.js'
import { encodeArguments, sleep } from '@nomicfoundation/hardhat-verify/internal/utilities'

export const verifyContract = async (
  client: PublicClient,
  instance: Etherscan,
  artifacts: Artifacts,
  contract: ContractInfo,
  callback?: ContractVerifierCallback,
) => {
  // check if contract is already verified
  if (await instance.isVerified(contract.address)) return
  // get contract information
  let contractInformation = await getContractInformation(client, artifacts, contract)

  await callback?.('contractVerificationStarted', {
    contractName: contractInformation.contractName,
    address: contract.address,
  })

  // resolve linked libraries
  contractInformation = await resolveLinkedLibraries(artifacts, contractInformation)
  // get encoded constructor arguments
  const encodedConstructorArgs: string = contract.constructorArgs
    ? await encodeArguments(
        contractInformation.contractOutput.abi,
        contractInformation.sourceName,
        contractInformation.contractName,
        contract.constructorArgs,
      )
    : await getConstructorArgsFromCreationCode(instance, contract.address, contractInformation)
  // verify contract
  const contractFQN = `${contractInformation.sourceName}:${contractInformation.contractName}`
  const { message: guid } = await instance.verify(
    contract.address,
    JSON.stringify(contractInformation.compilerInput),
    contractFQN,
    `v${contractInformation.solcLongVersion}`,
    encodedConstructorArgs,
  )
  await callback?.('contractVerificationSubmitted', {
    contractName: contractInformation.contractName,
    address: contract.address,
    guid,
  })

  // wait for 1 second before checking the status (avoid rate limiting)
  await sleep(1_000)

  const verificationStatus = await instance.getVerificationStatus(guid)

  const isSuccess = verificationStatus.isSuccess()

  if (isSuccess) {
    await callback?.('contractVerificationFinished', {
      contractName: contractInformation.contractName,
      address: contract.address,
      url: instance.browserUrl,
    })
  } else {
    throw new Error(
      `Failed to verify contract ${contractInformation.contractName} on the block explorer. at contract address: ${contract.address}`,
    )
  }
}
