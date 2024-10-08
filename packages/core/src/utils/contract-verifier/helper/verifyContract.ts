import { PublicClient } from 'viem'

import type { Artifacts } from 'hardhat/types/artifacts'

import { BaseError } from '@/errors/base'
import { GetContractInfoError, VerifyContractError } from '@/errors/contractVerifier'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan.js'
import { ContractInformation } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts.js'
import { encodeArguments, sleep } from '@nomicfoundation/hardhat-verify/internal/utilities.js'
import { ContractInfo, ContractVerifierCallback } from '../type'
import { getConstructorArgsFromCreationCode } from './getConstructorArgsFromCreationCode'
import { getContractInformation } from './getContractInformation'
import { isBlockscout } from './isBlockscout'
import { resolveLinkedLibraries } from './resolveLinkedLibraries'

export const verifyContract = async (
  client: PublicClient,
  instance: Etherscan,
  artifacts: Artifacts,
  contract: ContractInfo,
  callback?: ContractVerifierCallback,
): Promise<void> => {
  let contractInformation: ContractInformation
  const contractUrl = instance.getContractUrl(contract.address)

  try {
    contractInformation = await getContractInformation(client, artifacts, contract)
  } catch (error) {
    if (error instanceof BaseError) {
      throw error
    }

    throw new GetContractInfoError(contract.address, error)
  }

  try {
    // check if contract is already verified
    const isVerified = await instance.isVerified(contract.address)
    if (isVerified) {
      await callback?.('contractVerificationFinished', {
        contractName: contractInformation.contractName,
        address: contract.address,
        url: contractUrl,
        isAlreadyVerified: true,
      })

      return
    }
  } catch (error) {
    if (error instanceof BaseError) {
      throw error
    }

    throw new GetContractInfoError(contract.address, error)
  }

  await callback?.('contractVerificationStarted', {
    contractName: contractInformation.contractName,
    address: contract.address,
  })

  // resolve linked libraries
  try {
    contractInformation = await resolveLinkedLibraries(artifacts, contractInformation)
  } catch (error) {
    if (error instanceof BaseError) {
      throw error
    }

    throw new GetContractInfoError(contract.address, error)
  }

  // get encoded constructor arguments
  let encodedConstructorArgs: string = ''
  // note: blockscout does not require encoded constructor arguments for verification
  const flag: boolean = await isBlockscout(instance.apiUrl)
  if (!flag) {
    try {
      if (contract.constructorArgs) {
        encodedConstructorArgs = await encodeArguments(
          contractInformation.contractOutput.abi,
          contractInformation.sourceName,
          contractInformation.contractName,
          contract.constructorArgs,
        )
      } else {
        encodedConstructorArgs = await getConstructorArgsFromCreationCode(instance, contract.address, contractInformation)
      }
    } catch (error) {
      if (error instanceof BaseError) {
        throw error
      }

      throw new GetContractInfoError(contract.address, error)
    }
  }

  // verify contract
  const contractFQN = `${contractInformation.sourceName}:${contractInformation.contractName}`
  let guid: string

  try {
    const response = await instance.verify(
      contract.address,
      JSON.stringify(contractInformation.compilerInput),
      contractFQN,
      `v${contractInformation.solcLongVersion}`,
      encodedConstructorArgs,
    )

    guid = response.message
  } catch (error) {
    throw new VerifyContractError(contractInformation.contractName, contract.address, error)
  }

  await callback?.('contractVerificationSubmitted', {
    contractName: contractInformation.contractName,
    address: contract.address,
    guid,
  })

  // wait for 1 second before checking the status (avoid rate limiting)
  await sleep(1_000)

  let isSuccess: boolean
  let isAlreadyVerified: boolean

  try {
    const verificationStatus = await instance.getVerificationStatus(guid)

    isSuccess = verificationStatus.isSuccess()
    isAlreadyVerified = verificationStatus.isAlreadyVerified()
  } catch (error) {
    throw new VerifyContractError(contractInformation.contractName, contract.address, error)
  }

  if (isSuccess || isAlreadyVerified) {
    await callback?.('contractVerificationFinished', {
      contractName: contractInformation.contractName,
      address: contract.address,
      url: contractUrl,
      isAlreadyVerified: isAlreadyVerified,
    })
  } else {
    throw new VerifyContractError(contractInformation.contractName, contract.address)
  }
}
